import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';

import { EMULATOR_HOST } from './emulatorHost';

export const firebaseAuth = getAuth();

if (EMULATOR_HOST) connectAuthEmulator(firebaseAuth, `http://${EMULATOR_HOST}:9099`);
