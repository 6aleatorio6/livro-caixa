import { connectAuthEmulator, getAuth } from 'firebase/auth';

import { CONTRACT_EMULATORS } from '../contractEmulators';
import { contractApp } from './contractApp';

/** No teste de contrato, substitui o `firebaseAuth` do app (`jest.contract.config.mjs`). */
export const firebaseAuth = getAuth(contractApp);

connectAuthEmulator(firebaseAuth, CONTRACT_EMULATORS.authUrl, { disableWarnings: true });
