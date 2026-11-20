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
