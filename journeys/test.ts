// A rodada das jornadas: `pnpm journeys:test [fluxo | tag:<nome>]`. Prepara o emulador, apaga as
// rodadas antigas, liga o servidor de dados e roda o Maestro, com as capturas e o JUnit numa pasta
// por rodada. O Maestro e o adb chegam no PATH pelo claude-box; o adb conversa com o servidor do adb
// do PC, no localhost que o container divide com ele (`--network host`).
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { startDataServer } from './data/server.ts';

const FLOWS = fileURLToPath(new URL('flows', import.meta.url));
const CAPTURES = fileURLToPath(new URL('.local/captures', import.meta.url));
const EXPLORE_CAPTURES = join(CAPTURES, 'explore');
const SCREEN_CAPTURES = join(CAPTURES, 'screen');
const GOOGLE_SERVICES = fileURLToPath(new URL('../apps/mobile/google-services.json', import.meta.url));
const FIREBASE_CONFIG = fileURLToPath(new URL('../firebase.json', import.meta.url));
const DATA_PORT = 4020;
// Como em um projeto anterior: as últimas rodadas bastam para comparar com a anterior, e o resto só ocupa disco. A
// conta é por pasta, e só pega nomes de rodada: o que a conferência guarda com outro nome fica.
const KEPT_ROUNDS = 5;
const KEPT_SCREEN_CAPTURES = 20;
const ROUND_NAME = /^\d{4}-\d{2}-\d{2}-\d{6}$/;
const ANIMATION_SETTINGS = ['window_animation_scale', 'transition_animation_scale', 'animator_duration_scale'];

function readProjectInfo(): { project_id: string } {
  if (!existsSync(GOOGLE_SERVICES)) {
    throw new Error(`Falta o ${GOOGLE_SERVICES}: os emuladores e as jornadas usam o projeto do app.`);
  }
  return JSON.parse(readFileSync(GOOGLE_SERVICES, 'utf8')).project_info;
}

function readFirestorePort() {
  const { emulators } = JSON.parse(readFileSync(FIREBASE_CONFIG, 'utf8'));
  return emulators.firestore.port as number;
}

/** O nome da pasta da rodada, como `2026-10-24-210255`: o Node daqui vem sem os dados de locale. */
function roundName() {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function toMaestroSelection(target: string | undefined) {
  if (!target) return [FLOWS];
  if (target.startsWith('tag:')) return [`--include-tags=${target.slice('tag:'.length)}`, FLOWS];
  return [target];
}

/** Conta a rodada das jornadas de `flows/`; um fluxo de fora (o descartável da exploração) roda à parte. */
function isCountedRound(target: string | undefined) {
  if (!target || target.startsWith('tag:')) return true;
  const pathFromFlows = relative(FLOWS, resolve(target));
  return !pathFromFlows.startsWith('..');
}

function deleteOldRounds(folder: string) {
  const rounds = readdirSync(folder).filter((name) => ROUND_NAME.test(name)).sort();
  for (const oldRound of rounds.slice(0, -KEPT_ROUNDS)) rmSync(join(folder, oldRound), { recursive: true });
}

function deleteOldScreenCaptures() {
  if (!existsSync(SCREEN_CAPTURES)) return;
  const captures = readdirSync(SCREEN_CAPTURES)
    .map((name) => ({ path: join(SCREEN_CAPTURES, name), modifiedMs: statSync(join(SCREEN_CAPTURES, name)).mtimeMs }))
    .sort((newer, older) => older.modifiedMs - newer.modifiedMs);
  for (const { path } of captures.slice(KEPT_SCREEN_CAPTURES)) rmSync(path, { recursive: true });
}

// Liga o desenho dos apps, que a imagem ATD desliga a cada boot: sem ele, a tela e toda captura saem
// pretas. Vale para o app aberto depois daqui, e os fluxos o reabrem com `clearState`. E desliga as
// animações: cada transição de tela pesa em todo fluxo. Sem o emulador aberto, só avisa: o Maestro
// diz o resto.
function prepareEmulator() {
  const commands = ['setprop debug.hwui.drawing_enabled 1', ...ANIMATION_SETTINGS.map((setting) => `settings put global ${setting} 0`)];
  const { status } = spawnSync('adb', ['shell', commands.join('; ')], { stdio: 'ignore' });
  if (status !== 0) console.warn('Emulador não preparado: ele está aberto?');
}

/** Os avisos do servidor de dados no fim do resumo: uma repetição ou um cenário que falhou não passa em silêncio. */
function printDataServerWarnings(warnings: string[]) {
  console.log(`\nAvisos do servidor de dados: ${warnings.length === 0 ? 'nenhum' : warnings.length}`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

async function runRound(target: string | undefined) {
  // O servidor primeiro: com a porta ocupada, outra rodada está no ar, e nada aqui pode começar.
  const projectInfo = readProjectInfo();
  const dataServer = await startDataServer({
    port: DATA_PORT,
    firebaseProject: projectInfo.project_id,
    firestorePort: readFirestorePort(),
  });
  try {
    // Os fluxos descartáveis da exploração rodam à parte, sem empurrar para fora as rodadas que contam.
    const roundsFolder = isCountedRound(target) ? CAPTURES : EXPLORE_CAPTURES;
    const round = join(roundsFolder, roundName());
    mkdirSync(round, { recursive: true });
    deleteOldRounds(roundsFolder);
    deleteOldScreenCaptures();
    prepareEmulator();

    // Com `spawn`, e não `spawnSync`: o servidor de dados roda neste processo e responde durante a
    // rodada. O JUnit guarda o tempo de cada fluxo, que decide quando a suíte precisa rodar em paralelo.
    // O Maestro grava cada `takeScreenshot` em <rodada>/<sessão>/<fluxo>/takeScreenshot/.
    const maestro = spawn(
      'maestro',
      ['test', '--test-output-dir', round, '--format', 'junit', '--output', join(round, 'report.xml'), ...toMaestroSelection(target)],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          MAESTRO_DATA_URL: `http://127.0.0.1:${DATA_PORT}`,
          // Sem o aviso de telemetria e o quadro do "Analyze with AI" a cada rodada.
          MAESTRO_CLI_NO_ANALYTICS: '1',
          MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
        },
      },
    );
    // Um `error` (o Maestro fora do PATH) rejeita o `once`, e o `finally` ainda fecha o servidor.
    const [exitCode] = await once(maestro, 'exit');
    printDataServerWarnings(dataServer.warnings);
    return typeof exitCode === 'number' ? exitCode : 1;
  } finally {
    // Aberto, o servidor seguraria o processo vivo depois de qualquer falha daqui.
    await dataServer.close();
  }
}

try {
  process.exitCode = await runRound(process.argv[2]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
