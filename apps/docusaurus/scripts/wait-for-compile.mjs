// @ts-check
// Espera a compilação que o save de uma doc disparou no `pnpm dev:docs` e imprime o desfecho, lido
// do arquivo que o plugin `compile-errors` grava (README do app, "Erros de compilação").
import { readFileSync, statSync } from 'node:fs';
import { createConnection } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { COMPILE_ERRORS_LOG, isCompiling as isCompilingLog } from '../src/plugins/compile-errors/error-log-file.mjs';

const LOG_FILE = fileURLToPath(new URL(`../${COMPILE_ERRORS_LOG}`, import.meta.url));
const DOCS_SERVER_PORT = 4000;
// O save chega ao webpack depois de o editor gravar: sem a espera, a primeira leitura pega o
// estado de antes do save.
const SAVE_REACHES_COMPILER_MS = 1000;
const POLL_INTERVAL_MS = 200;
// Um save dispara mais de uma compilação seguida (as rotas se regeneram e o webpack compila de
// novo): vale o estado que dura, não a primeira mudança.
const STABLE_FOR_MS = 2000;
const NEVER_SEEN_AFTER_MS = 10_000;
const GIVE_UP_AFTER_MS = 60_000;

function readLog() {
  try {
    return readFileSync(LOG_FILE, 'utf8');
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') return null;
    throw error;
  }
}

/** @returns {Promise<boolean>} */
function isServerAnswering() {
  return new Promise((resolve) => {
    // `localhost`, e não `127.0.0.1`: o Docusaurus escuta em `localhost`, que o Node pode resolver
    // só para `::1`; com o nome, a conexão tenta as duas famílias.
    const socket = createConnection({ host: 'localhost', port: DOCS_SERVER_PORT, timeout: 1000 });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

/** @param {() => boolean | undefined} isServerUp o que a porta respondeu, quando já respondeu */
async function watchLog(isServerUp) {
  const startedAt = Date.now();
  let log = readLog();
  let changedAt = startedAt;
  let hasChanged = false;
  for (;;) {
    const isCompiling = log !== null && isCompilingLog(log);
    const wasSeen = log !== null || hasChanged;
    const isSettled = wasSeen && !isCompiling && Date.now() - changedAt >= STABLE_FOR_MS;
    const isNeverSeen = !wasSeen && Date.now() - startedAt >= NEVER_SEEN_AFTER_MS;
    // Com o log parado e nada na porta, esperar mais não muda o desfecho.
    const isServerDown = !hasChanged && isServerUp() === false && Date.now() - startedAt >= STABLE_FOR_MS;
    const hasGivenUp = Date.now() - startedAt >= GIVE_UP_AFTER_MS;
    if (isSettled || isNeverSeen || isServerDown || hasGivenUp) return { log, hasChanged, isCompiling };

    await sleep(POLL_INTERVAL_MS);
    const current = readLog();
    if (current !== log) {
      log = current;
      changedAt = Date.now();
      hasChanged = true;
    }
  }
}

function writtenAgo() {
  const stats = statSync(LOG_FILE, { throwIfNoEntry: false });
  return stats ? `gravado há ${Math.round((Date.now() - stats.mtimeMs) / 1000)} s` : 'apagado agora há pouco';
}

/** @type {boolean | undefined} */
let firstProbe;
void isServerAnswering().then((isAnswering) => (firstProbe = isAnswering));
await sleep(SAVE_REACHES_COMPILER_MS);
const { log, hasChanged, isCompiling } = await watchLog(() => firstProbe);
const logAge = log === null ? null : writtenAgo();
// O log que mudou durante a espera já prova que o servidor está no ar; a porta só desempata
// quando nada se mexeu, e é perguntada de novo porque ele pode ter caído durante a espera.
const isServerUp = (hasChanged && !isCompiling) || (await isServerAnswering());

if (!isServerUp) {
  console.log(`Nada responde na ${DOCS_SERVER_PORT}: o servidor de docs está fora do ar. Peça a quem desenvolve que suba o \`pnpm dev:docs\`.`);
  if (log !== null) console.log(`\nO log abaixo é de antes de o servidor cair (${logAge}):\n\n${log}`);
} else if (isCompiling) {
  console.log(`Ainda compilando depois de ${GIVE_UP_AFTER_MS / 1000} s; rode o script de novo.\n\n${log}`);
} else if (log === null) {
  console.log(hasChanged ? 'Limpo: a última compilação passou.' : 'O log não apareceu, mas o servidor responde: a compilação passou rápido demais para ser vista.');
} else if (hasChanged) {
  console.log(`Erros da compilação (${logAge}):\n\n${log}`);
} else {
  console.log(`O log não mudou durante a espera (${logAge}): são os erros da última compilação, que pode ter sido antes do save.\n\n${log}`);
}
process.exitCode = isServerUp && log === null ? 0 : 1;
