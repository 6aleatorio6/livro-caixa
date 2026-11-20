// O acesso dos scripts ao Firebase pela API REST, com a conta do `firebase login`: o mesmo acesso de dono do console,
// sem chave de conta de serviço. Com `FIRESTORE_EMULATOR_HOST` definido, fala com o emulador.
import { createRequire } from 'node:module';

export const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'livro-caixa-f1782';
export const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
export const firestoreBase = `${
  usingEmulator ? `http://${process.env.FIRESTORE_EMULATOR_HOST}` : 'https://firestore.googleapis.com'
}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
  if (!response.ok) throw new Error(`${url} respondeu ${response.status}: ${await response.text()}`);
  return response.json();
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
    const results = await request(`${firestoreBase}:runQuery`, {
      method: 'POST',
      body: JSON.stringify({ structuredQuery, readTime }),
    });
    const documents = results.flatMap((result) => (result.document ? [result.document] : []));
    yield* documents;
    if (documents.length < pageSize) return;
    lastName = documents.at(-1).name;
  }
}
