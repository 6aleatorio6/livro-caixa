import { doc, updateDoc } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * Grava o nome da própria pessoa na lista: na primeira entrada (o da conta Google, junto com o `uid`
 * do login) e quando ela o troca (só o nome). A regra só deixa mexer no `name` do próprio e-mail, com
 * texto, e no `uid` dele uma vez. Não apara: quem chama apara. Grava só os campos recebidos.
 */
export function changeOwnNameService({ email, name, uid }: { email: string; name: string; uid?: string }) {
  return updateDoc(
    doc(firestoreDb, 'allowedEmails', allowedEmailId(email)),
    uid === undefined ? { name } : { name, uid },
  );
}
