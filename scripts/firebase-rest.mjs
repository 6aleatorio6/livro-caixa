// O acesso dos scripts ao Firebase pela API REST, com a conta do `firebase login`: o mesmo acesso de dono do console,
// sem chave de conta de serviço. Com `FIRESTORE_EMULATOR_HOST` definido, fala com o emulador.
import { createRequire } from 'node:module';

export const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'livro-caixa-f1782';
export const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
/** O caminho dos documentos do banco, que começa o nome de cada documento e as URLs da API REST. */
export const documentsPath = `projects/${PROJECT_ID}/databases/(default)/documents`;
export const firestoreBase = `${
  usingEmulator ? `http://${process.env.FIRESTORE_EMULATOR_HOST}` : 'https://firestore.googleapis.com'
}/v1/${documentsPath}`;

async function authorization() {
  if (usingEmulator) return 'Bearer owner';
  const require = createRequire(import.meta.url);
  const auth = require('firebase-tools/lib/auth');
  const { CLOUD_PLATFORM } = require('firebase-tools/lib/scopes');
  const account = auth.getGlobalDefaultAccount();
  if (!account) {
    console.error('Nenhuma conta do Firebase CLI: rode `pnpm exec firebase login`.');
    process.exit(1);
  }
  const { access_token: token } = await auth.getAccessToken(account.tokens.refresh_token, [CLOUD_PLATFORM]);
  return `Bearer ${token}`;
}

let headersPromise;

/** Os cabeçalhos de toda chamada, com o token pedido uma vez por execução (ele vale 1 h). */
export function authorizedHeaders() {
  headersPromise ??= authorization().then((value) => ({ Authorization: value, 'Content-Type': 'application/json' }));
  return headersPromise;
}

/** Uma chamada que precisa dar certo: devolve o JSON da resposta ou lança o erro com o status e o corpo. */
export async function request(url, init) {
  const response = await fetch(url, { headers: await authorizedHeaders(), ...init });
  if (!response.ok) {
    const error = new Error(`${url} respondeu ${response.status}: ${await response.text()}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/** O nome completo de um documento (`settings/app`), que um `Write` da API REST leva no lugar do caminho. */
export function documentName(path) {
  return `${documentsPath}/${path}`;
}

/** O caminho (`settings/app`) de um nome completo de documento: o inverso do `documentName`. */
export function documentPath(name) {
  return name.slice(name.indexOf('/documents/') + '/documents/'.length);
}

const post = (body) => ({ method: 'POST', body: JSON.stringify(body) });

/** Abre uma transação de leitura e escrita e devolve o id dela. */
export async function beginTransaction() {
  const { transaction } = await request(`${firestoreBase}:beginTransaction`, post({ options: { readWrite: {} } }));
  return transaction;
}

/**
 * Um documento (`{ name, fields }`), ou `null` se ele não existe. Com `transaction`, a leitura é da transação e vai pelo
 * `:batchGet` de um documento: o `GET` com `?transaction=` nunca responde no emulador, e prende a trava da transação.
 */
export async function getDocument(path, { transaction } = {}) {
  if (transaction) {
    const [result] = await request(`${firestoreBase}:batchGet`, post({ documents: [documentName(path)], transaction }));
    return result.found ?? null;
  }
  try {
    return await request(`${firestoreBase}/${path}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/** Grava as escritas (`Write` da API REST) num commit só; com `transaction`, encerra a transação junto. */
export function commit(writes, { transaction } = {}) {
  return request(`${firestoreBase}:commit`, post({ writes, transaction }));
}

/** Desfaz a transação e solta as travas dos documentos que ela leu. */
export function rollback(transaction) {
  return request(`${firestoreBase}:rollback`, post({ transaction }));
}

/**
 * Os documentos de uma coleção, página a página, pelo `runQuery`. `fields` limita os campos que vêm; `readTime` lê a
 * coleção como ela estava naquele instante, que o Firestore aceita até 1 h atrás. É o `runQuery`, e não o `list`,
 * porque o emulador só entende o `readTime` no corpo, e assim o caminho testado nele é o mesmo da produção.
 */
export async function* listDocuments(collectionId, { pageSize = 300, fields, readTime } = {}) {
  let lastName;
  for (;;) {
    const structuredQuery = {
      from: [{ collectionId }],
      orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }],
      limit: pageSize,
    };
    if (fields) structuredQuery.select = { fields: fields.map((fieldPath) => ({ fieldPath })) };
    if (lastName) structuredQuery.startAt = { values: [{ referenceValue: lastName }], before: false };
    const results = await request(`${firestoreBase}:runQuery`, post({ structuredQuery, readTime }));
    const documents = results.flatMap((result) => (result.document ? [result.document] : []));
    yield* documents;
    if (documents.length < pageSize) return;
    lastName = documents.at(-1).name;
  }
}
