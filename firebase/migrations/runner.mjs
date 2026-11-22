// O executor das migrações de dados (docs/05-arquitetura/06-migracoes-de-dados.md). Cada migração é um arquivo
// `<x.y.z>.mjs` com `export default async function migrate(tx)`, que lê pelo `tx` (`tx.get(caminho)`, `tx.name(caminho)`)
// e devolve a lista de escritas (`Write` da API REST). O executor a roda numa transação, junto com a conferência da
// versão do banco e a gravação da versão nova, e só a transação grava.
//
// Nenhum caminho daqui lê com `GET ?transaction=`: no emulador ele nunca responde e prende a trava da transação.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { beginTransaction, commit, documentName, getDocument, rollback } from '../../scripts/firebase-rest.mjs';
import init, { INIT_VERSION } from './init.mjs';

const SETTINGS = 'settings/app';
const defaultDir = dirname(fileURLToPath(import.meta.url));

const isVersion = (value) => /^\d+\.\d+\.\d+$/.test(value);
const versionParts = (version) => version.split('.').map(Number);

function compareVersions(a, b) {
  const [left, right] = [versionParts(a), versionParts(b)];
  return left.reduce((difference, part, index) => difference || part - right[index], 0);
}

/** As versões das migrações de uma pasta, em ordem numérica (a 0.10.0 depois da 0.9.0). */
export function migrationsIn(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.mjs'))
    .map((file) => file.slice(0, -'.mjs'.length))
    .filter(isVersion)
    .sort(compareVersions);
}

/** O `version` do banco, lido por `read` (o `tx.get` de uma transação, ou o `getDocument` fora dela). */
async function databaseVersion(read) {
  return (await read(SETTINGS))?.fields?.version?.stringValue;
}

/**
 * Roda `work(tx)` numa transação e a encerra: com `commit`, grava as escritas que ele devolve; sem, desfaz. Qualquer erro
 * também desfaz, e nenhum caminho sai com a transação aberta, que prenderia as travas até ela expirar.
 */
async function inTransaction(work, { commit: shouldCommit }) {
  const transaction = await beginTransaction();
  const tx = { get: (path) => getDocument(path, { transaction }), name: documentName };
  try {
    const writes = await work(tx);
    await (shouldCommit ? commit(writes, { transaction }) : rollback(transaction));
    return writes;
  } catch (error) {
    await rollback(transaction).catch(() => {});
    throw error;
  }
}

/** O `version` e o `minVersion` (o campo que os apps antigos leem) do banco; o `updateMask` poupa o resto do documento. */
const versionWrite = (version) => ({
  update: {
    name: documentName(SETTINGS),
    fields: { version: { stringValue: version }, minVersion: { stringValue: version } },
  },
  updateMask: { fieldPaths: ['version', 'minVersion'] },
});

/**
 * Recusa um banco que já tem `version`. O `pnpm migrate:init` a chama antes do backup, fora da transação, e o `runInit`
 * de novo, dentro dela.
 */
export async function assertWithoutVersion(read = getDocument) {
  const current = await databaseVersion(read);
  if (current) throw new Error(`O banco já tem a versão ${current}: o init só roda num banco sem versão.`);
}

/** O `init`: só num banco sem `version`, e numa transação. */
export async function runInit() {
  await inTransaction(
    async (tx) => {
      await assertWithoutVersion(tx.get);
      return init(tx);
    },
    { commit: true },
  );
}

/** As versões a rodar: as migrações depois da versão do banco, até a do pacote (`target`). */
export async function planPending(target, { dir = defaultDir } = {}) {
  const current = await databaseVersion(getDocument);
  if (!current) throw new Error('O banco não tem versão: rode `pnpm migrate:init` antes.');
  // Fora do formato, a comparação dá `NaN`, nenhuma migração entra no plano e o `pnpm migrate` diria que não há nada.
  if (!isVersion(current)) throw new Error(`O version do banco, "${current}", não é uma versão de três números.`);
  if (compareVersions(current, target) > 0) {
    throw new Error(`O banco está na versão ${current}, acima da ${target} do pacote.`);
  }
  return migrationsIn(dir).filter(
    (version) => compareVersions(version, current) > 0 && compareVersions(version, target) <= 0,
  );
}

/** Confere que o banco está na versão da migração anterior (ou na 0.0.0, se for a primeira) e devolve as escritas dela. */
async function writesOf(version, dir, tx) {
  const versions = migrationsIn(dir);
  const index = versions.indexOf(version);
  if (index === -1) throw new Error(`Não há migração ${version} em ${dir}.`);
  const expected = versions[index - 1] ?? INIT_VERSION;
  const current = await databaseVersion(tx.get);
  if (current !== expected) {
    throw new Error(`A migração ${version} só roda com o banco na versão ${expected}, e ele está na ${current}.`);
  }
  const { default: migrate } = await import(pathToFileURL(join(dir, `${version}.mjs`)).href);
  return migrate(tx);
}

/** As escritas que a migração faria agora, numa transação que é desfeita: nada é gravado. */
export async function previewMigration(version, { dir = defaultDir } = {}) {
  return inTransaction((tx) => writesOf(version, dir, tx), { commit: false });
}

/**
 * A migração numa transação só: confere a versão do banco, roda a migração e grava as escritas dela com o `version` e o
 * `minVersion` novos. Com `expectedWrites` (as da prévia), aborta se as escritas mudaram desde então.
 */
export async function runMigration(version, { dir = defaultDir, expectedWrites } = {}) {
  await inTransaction(
    async (tx) => {
      const writes = await writesOf(version, dir, tx);
      if (expectedWrites && JSON.stringify(writes) !== JSON.stringify(expectedWrites)) {
        throw new Error(`As escritas da migração ${version} mudaram desde a prévia: nada foi gravado.`);
      }
      return [...writes, versionWrite(version)];
    },
    { commit: true },
  );
}
