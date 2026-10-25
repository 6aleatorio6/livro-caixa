import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

import { CONTRACT_EMULATORS } from '../contractEmulators';
import { contractApp } from './contractApp';

/** No teste de contrato, substitui o `firestoreDb` do app (`jest.contract.config.mjs`). */
export const firestoreDb = getFirestore(contractApp);

connectFirestoreEmulator(firestoreDb, CONTRACT_EMULATORS.firestoreHost, CONTRACT_EMULATORS.firestorePort);
