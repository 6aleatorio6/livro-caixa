// O `firebase emulators:exec` do `pnpm test:contract` passa o projeto e o endereço dos emuladores que
// sobe para o teste. Sem eles, o teste cairia nas portas da pilha das jornadas e gravaria nas contas delas.
const { GCLOUD_PROJECT, FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST } = process.env;
if (!GCLOUD_PROJECT || !FIRESTORE_EMULATOR_HOST || !FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Rode os testes de contrato pelo `pnpm test:contract`, que sobe os emuladores deles.');
}
const [firestoreHost, firestorePort] = FIRESTORE_EMULATOR_HOST.split(':');

/** Onde os testes de contrato gravam: um projeto `demo-`, que só existe nos emuladores. */
export const CONTRACT_EMULATORS = {
  projectId: GCLOUD_PROJECT,
  firestoreHost,
  firestorePort: Number(firestorePort),
  authUrl: `http://${FIREBASE_AUTH_EMULATOR_HOST}`,
};
