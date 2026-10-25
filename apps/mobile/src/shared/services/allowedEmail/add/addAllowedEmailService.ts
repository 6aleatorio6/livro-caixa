import { doc, setDoc } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * O admin coloca uma pessoa na lista: ela nasce como membro, sem lançamentos e sem nome nem `uid`,
 * que o app grava na primeira entrada dela.
 */
export function addAllowedEmailService({ email }: { email: string }) {
  return setDoc(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), {
    isAdmin: false,
    hasEntries: false,
  });
}
