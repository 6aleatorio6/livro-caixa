import { connectFirestoreEmulator, getFirestore } from '@react-native-firebase/firestore';

import { EMULATOR_HOST } from './emulatorHost';

export const firestoreDb = getFirestore();

if (EMULATOR_HOST) connectFirestoreEmulator(firestoreDb, EMULATOR_HOST, 8080);
