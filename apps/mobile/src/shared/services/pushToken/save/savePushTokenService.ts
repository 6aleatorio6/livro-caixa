import { doc, setDoc } from '@react-native-firebase/firestore';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * Grava o token do Expo deste celular com o `uid` de quem está logado. Gravar de novo o mesmo token troca o `uid`: é o
 * celular que muda de dono quando outra pessoa entra nele. A regra só deixa gravar o próprio `uid`.
 */
export async function savePushTokenService(token: string) {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Não há sessão para guardar o token de notificação');

  await setDoc(doc(firestoreDb, 'pushTokens', token), { uid });
}
