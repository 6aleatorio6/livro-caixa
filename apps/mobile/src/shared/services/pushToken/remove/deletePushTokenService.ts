import { deleteDoc, doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** Apaga o token deste celular, quando quem entrou nele sai. A regra só deixa apagar o token do próprio `uid`. */
export function deletePushTokenService(token: string) {
  return deleteDoc(doc(firestoreDb, 'pushTokens', token));
}
