import { doc, setDoc } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** O admin coloca uma pessoa na lista: ela nasce como membro e sem lançamentos. */
export function addAllowedEmailService({ name, email }: { name: string; email: string }) {
  return setDoc(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), {
    name: name.trim(),
    isAdmin: false,
    hasEntries: false,
  });
}
