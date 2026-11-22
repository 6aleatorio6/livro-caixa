// O `pnpm migrate`: roda as migrações de dados pendentes, da versão do banco até a do `package.json` da raiz, uma por
// vez. `pnpm migrate:init` (`--init`) grava a versão 0.0.0 num banco que ainda não tem `version`. Regras e motivos:
// docs/05-arquitetura/06-migracoes-de-dados.md.
//
// Antes de gravar, roda o `pnpm backup` (o gpg pede a frase no terminal) e para se ele falhar; sem migração pendente,
// não grava nem faz backup. Cada migração mostra as
// escritas que fará, pergunta se pode gravar e só então roda, numa transação, com as escritas mostradas: se o banco
// mudou entre a prévia e a gravação, ela aborta. A pergunta fica fora da transação, que expira com 60 s parada.
// Com `FIRESTORE_EMULATOR_HOST` e `FIREBASE_AUTH_EMULATOR_HOST` definidos, migra o emulador: o backup pede os dois.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import { INIT_VERSION } from '../firebase/migrations/init.mjs';
import {
  assertWithoutVersion,
  planPending,
  previewMigration,
  runInit,
  runMigration,
} from '../firebase/migrations/runner.mjs';
import { documentPath } from './firebase-rest.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const versionIn = (packagePath) => JSON.parse(readFileSync(join(root, packagePath), 'utf8')).version;

// A versão até onde migrar. A trava compara com a do app, que o APK tira do `package.json` de `apps/mobile`: com os
// dois em versões diferentes, a migração travaria o APK novo ou deixaria os antigos abertos.
function targetVersion() {
  const [target, appVersion] = [versionIn('package.json'), versionIn('apps/mobile/package.json')];
  if (target !== appVersion) {
    throw new Error(`o package.json da raiz está na ${target} e o do app na ${appVersion}: suba os dois juntos.`);
  }
  return target;
}

function runBackup() {
  const { status } = spawnSync('node', [join(root, 'scripts', 'backup.mjs')], { stdio: 'inherit' });
  if (status !== 0) throw new Error('o backup falhou, e sem ele nada é migrado.');
}

// O caminho do documento que a escrita atinge e o que ela faz com ele.
function describeWrite(write) {
  const kind = ['update', 'delete', 'transform'].find((key) => key in write);
  const name = kind === 'update' ? write.update.name : kind === 'delete' ? write.delete : write.transform.document;
  return { kind, path: documentPath(name) };
}

function showWrites(writes) {
  const perCollection = {};
  for (const write of writes) {
    const { kind, path } = describeWrite(write);
    console.log(`  ${kind} ${path}`);
    const collection = path.split('/').at(-2);
    perCollection[collection] = (perCollection[collection] ?? 0) + 1;
  }
  if (writes.length === 0) {
    console.log('  nenhuma escrita de dados');
    return;
  }
  console.log(
    `  ${writes.length} escrita(s): ${Object.entries(perCollection)
      .map(([collection, count]) => `${collection} ${count}`)
      .join(', ')}`,
  );
}

async function confirm(question) {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await terminal.question(question)).trim().toLowerCase() === 's';
  } finally {
    terminal.close();
  }
}

try {
  if (process.argv.slice(2).includes('--init')) {
    // Antes do backup, para um banco que já tem versão não custar a frase do gpg nem um arquivo à toa.
    await assertWithoutVersion();
    runBackup();
    await runInit();
    console.log(`Banco iniciado na versão ${INIT_VERSION}.`);
  } else {
    const target = targetVersion();
    const pending = await planPending(target);
    if (pending.length === 0) console.log(`Nenhuma migração pendente até a versão ${target}.`);
    else runBackup();
    for (const version of pending) {
      const writes = await previewMigration(version);
      console.log(`\nMigração ${version}:`);
      showWrites(writes);
      console.log(`  e o version e o minVersion de settings/app vão para ${version}, o que trava os apps abaixo dela.`);
      if (!(await confirm(`Gravar a migração ${version}? (s/N) `))) {
        console.log('Nada foi gravado, e as migrações seguintes ficam para outra vez.');
        break;
      }
      await runMigration(version, { expectedWrites: writes });
      console.log(`Migração ${version} gravada.`);
    }
  }
} catch (error) {
  console.error(`Migração não feita: ${error.message}`);
  process.exit(1);
}
