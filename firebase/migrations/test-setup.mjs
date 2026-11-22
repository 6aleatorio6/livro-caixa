// O que os testes das migrações compartilham: o emulador limpo antes de cada caso, o banco da versão anterior gravado
// pela REST com o dono, e pastas de migrações de mentira. Os testes chamam o `runner`, nunca o `scripts/migrate.mjs`
// (que faz o backup e pergunta antes de gravar).
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { authorizedHeaders, documentsPath, firestoreBase, getDocument, request, usingEmulator } from '../../scripts/firebase-rest.mjs';

if (!usingEmulator) throw new Error('Os testes das migrações apagam o banco: rode `pnpm test:migrations`, que sobe o emulador.');

/** Um texto no formato de valores da API REST. */
export const text = (value) => ({ stringValue: value });

/** O `settings/app` depois de uma migração: o `version` e o `minVersion` na mesma versão. */
export const versionOf = (version) => ({ version: text(version), minVersion: text(version) });

/** Apaga todos os documentos do emulador. */
export async function resetEmulator() {
  const url = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/${documentsPath}`;
  const response = await fetch(url, { method: 'DELETE', headers: await authorizedHeaders() });
  if (!response.ok) throw new Error(`${url} respondeu ${response.status}: ${await response.text()}`);
}

/** Grava um documento inteiro, no formato de valores da API REST (`{ stringValue: '0.4.0' }`). */
export function seed(path, fields) {
  return request(`${firestoreBase}/${path}`, { method: 'PATCH', body: JSON.stringify({ fields }) });
}

/** Os campos de um documento, ou `undefined` se ele não existe. */
export async function fieldsOf(path) {
  return (await getDocument(path))?.fields;
}

const createdDirs = [];
process.on('exit', () => {
  for (const dir of createdDirs) rmSync(dir, { recursive: true, force: true });
});

/** Uma pasta temporária com uma migração por versão: `{ '0.1.0': <código do módulo> }`. Cada caso cria a sua. */
export function makeMigrationsDir(migrations) {
  const dir = mkdtempSync(join(tmpdir(), 'migrations-'));
  createdDirs.push(dir);
  for (const [version, source] of Object.entries(migrations)) writeFileSync(join(dir, `${version}.mjs`), source);
  return dir;
}

/** Uma migração que grava `done: true` no documento `entries/<id>`. */
export function markDone(id) {
  return `export default async function migrate(tx) {
  return [{ update: { name: tx.name('entries/${id}'), fields: { done: { booleanValue: true } } }, updateMask: { fieldPaths: ['done'] } }];
}`;
}
