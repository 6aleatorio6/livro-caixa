// Volta os dados ao ponto de partida das jornadas: o Firestore do emulador apagado e a lista de
// e-mails permitidos com as contas de teste. Roda no Maestro, no começo de cada fluxo.
// As contas moram só aqui: os fluxos as leem de `output.accounts`.

if (typeof MAESTRO_FIREBASE_PROJECT === 'undefined') {
  throw new Error('Falta MAESTRO_FIREBASE_PROJECT: quem exporta é o journeys/env.sh, pelo journeys/maestro.sh.');
}

const ACCOUNTS = {
  admin: { email: 'ana.souza@exemplo.com', name: 'Ana Souza', isAllowed: true, isAdmin: true },
  member: { email: 'bruno.souza@exemplo.com', name: 'Bruno Souza', isAllowed: true, isAdmin: false },
  outsider: { email: 'carla.lima@exemplo.com', name: 'Carla Lima', isAllowed: false, isAdmin: false },
};

const FIRESTORE = 'http://localhost:8080';
const DATABASE = `/projects/${MAESTRO_FIREBASE_PROJECT}/databases/(default)/documents`;
const DOCUMENTS = `${FIRESTORE}/v1${DATABASE}`;
// O emulador trata `Bearer owner` como administrador: a escrita passa por cima das regras.
const AS_OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };

function ensureSucceeded(response, what) {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${what} falhou: ${response.status} ${response.body}`);
  }
}

ensureSucceeded(http.request(`${FIRESTORE}/emulator/v1${DATABASE}`, { method: 'DELETE' }), 'Apagar o Firestore');

for (const account of Object.values(ACCOUNTS)) {
  if (account.isAllowed) {
    const fields = {
      name: { stringValue: account.name },
      isAdmin: { booleanValue: account.isAdmin },
      hasEntries: { booleanValue: false },
    };
    const response = http.request(`${DOCUMENTS}/allowedEmails/${encodeURIComponent(account.email)}`, {
      method: 'PATCH',
      headers: AS_OWNER,
      body: JSON.stringify({ fields }),
    });
    ensureSucceeded(response, `Liberar ${account.email}`);
  }
  account.signInLink =
    `livrocaixa://test-sign-in?email=${encodeURIComponent(account.email)}&name=${encodeURIComponent(account.name)}`;
}

output.accounts = ACCOUNTS;
// Para um fluxo mexer nos dados depois, como o `removeAllowedEmail.js`.
output.firestoreDocumentsUrl = DOCUMENTS;
