import { connectStorageEmulator, getStorage, setMaxUploadRetryTime } from '@react-native-firebase/storage';

import { EMULATOR_HOST } from './emulatorHost';

export const firebaseStorage = getStorage();

if (EMULATOR_HOST) connectStorageEmulator(firebaseStorage, EMULATOR_HOST, 9199);

// Sem rede, o envio tenta de novo por 10 minutos por padrão e o carregamento fica na tela; aos 30 s o
// `putFile` falha e o serviço devolve `RECEIPT_UPLOAD_FAILED`.
setMaxUploadRetryTime(firebaseStorage, 30_000);
