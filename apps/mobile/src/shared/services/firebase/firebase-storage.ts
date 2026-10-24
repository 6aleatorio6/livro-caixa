import { connectStorageEmulator, getStorage } from '@react-native-firebase/storage';

import { EMULATOR_HOST } from './emulator-host';

export const firebaseStorage = getStorage();

if (EMULATOR_HOST) connectStorageEmulator(firebaseStorage, EMULATOR_HOST, 9199);
