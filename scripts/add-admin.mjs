// O `pnpm add-admin <email>`: faz da pessoa a admin do app, gravando `isAdmin: true` na entrada dela em
// `allowedEmails` (o app não cria admin: as regras só deixam o console ou o Admin SDK fazer isso). Usa a conta
// do `firebase login` e o Firestore de verdade (`firebase-rest.mjs`); com `FIRESTORE_EMULATOR_HOST` definido, grava
// no emulador. O ID da entrada é o e-mail em minúsculas. Uma entrada que já existe só ganha o `isAdmin`; as outras
// chaves (`name`, `uid`, `hasEntries`) ficam como estão.
import { authorizedHeaders, firestoreBase, PROJECT_ID } from './firebase-rest.mjs';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: pnpm add-admin <email>');
  process.exit(1);
}

const url = `${firestoreBase}/allowedEmails/${encodeURIComponent(email)}`;
const headers = await authorizedHeaders();

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
