// O `pnpm add-admin <email>`: faz da pessoa a admin do app, gravando `isAdmin: true` na entrada dela em
// `allowedEmails` (o app não cria admin: as regras só deixam o console ou o Admin SDK fazer isso). Usa a conta
// do `firebase login` e o Firestore de verdade; com `FIRESTORE_EMULATOR_HOST` definido, grava no emulador.
// O ID da entrada é o e-mail em minúsculas. Uma entrada que já existe só ganha o `isAdmin`; as outras chaves
// (`name`, `uid`, `hasEntries`) ficam como estão.
import { createRequire } from 'node:module';

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? 'livro-caixa-f1782';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: pnpm add-admin <email>');
  process.exit(1);
}

async function authorization() {
  if (process.env.FIRESTORE_EMULATOR_HOST) return 'Bearer owner';
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

const host = process.env.FIRESTORE_EMULATOR_HOST
  ? `http://${process.env.FIRESTORE_EMULATOR_HOST}`
  : 'https://firestore.googleapis.com';
const url = `${host}/v1/projects/${PROJECT_ID}/databases/(default)/documents/allowedEmails/${encodeURIComponent(email)}`;
const headers = { Authorization: await authorization(), 'Content-Type': 'application/json' };

async function fail(response) {
  console.error(`Firestore respondeu ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const current = await fetch(url, { headers });
if (current.status !== 404 && !current.ok) await fail(current);
const exists = current.ok;

const fields = exists
  ? { isAdmin: { booleanValue: true } }
  : { isAdmin: { booleanValue: true }, hasEntries: { booleanValue: false } };
const mask = Object.keys(fields).map((path) => `updateMask.fieldPaths=${path}`).join('&');

const response = await fetch(`${url}?${mask}`, { method: 'PATCH', headers, body: JSON.stringify({ fields }) });
if (!response.ok) await fail(response);

console.log(`${email} agora é admin${exists ? '' : ' (entrada criada)'} no projeto ${PROJECT_ID}.`);
