import { connectStorageEmulator, getStorage } from '@react-native-firebase/storage';

import { EMULATOR_HOST } from './emulatorHost';

export const firebaseStorage = getStorage();

if (EMULATOR_HOST) connectStorageEmulator(firebaseStorage, EMULATOR_HOST, 9199);
