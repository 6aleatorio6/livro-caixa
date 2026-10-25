import { connectStorageEmulator, getStorage } from 'firebase/storage';

import { CONTRACT_EMULATORS } from '../contractEmulators';
import { contractApp } from './contractApp';

/** No teste de contrato, substitui o `firebaseStorage` do app (`jest.contract.config.mjs`). */
export const firebaseStorage = getStorage(contractApp);

connectStorageEmulator(firebaseStorage, CONTRACT_EMULATORS.storageHost, CONTRACT_EMULATORS.storagePort);
