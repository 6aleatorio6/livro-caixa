import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

import { CONTRACT_EMULATORS } from './contractEmulators';

/**
 * O acesso de administrador ao projeto dos testes de contrato: apaga os dados entre os testes e grava
 * os documentos dos cenários sem passar pelas regras. As regras do app, o emulador já carrega na
 * subida (`firebase/firebase.test.json`).
 */
export const rulesTestEnvironment = initializeTestEnvironment({
  projectId: CONTRACT_EMULATORS.projectId,
  firestore: { host: CONTRACT_EMULATORS.firestoreHost, port: CONTRACT_EMULATORS.firestorePort },
  storage: { host: CONTRACT_EMULATORS.storageHost, port: CONTRACT_EMULATORS.storagePort },
});
