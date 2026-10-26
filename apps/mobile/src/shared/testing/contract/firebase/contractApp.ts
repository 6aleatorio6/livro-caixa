import { initializeApp } from 'firebase/app';

import { CONTRACT_EMULATORS } from '../contractEmulators';

/** O app do SDK JavaScript do Firebase que faz o papel do nativo nos testes de contrato. */
export const contractApp = initializeApp({
  projectId: CONTRACT_EMULATORS.projectId,
  apiKey: CONTRACT_EMULATORS.projectId,
});
