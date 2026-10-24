import { deleteDoc, doc } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** O admin tira uma pessoa da lista; a regra só deixa quando ela não é admin e não tem lançamentos. */
export function removeAllowedEmailService({ email }: { email: string }) {
  return deleteDoc(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)));
}
