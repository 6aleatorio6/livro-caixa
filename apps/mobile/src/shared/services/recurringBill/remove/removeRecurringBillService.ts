import { deleteDoc, doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** Qualquer membro exclui uma conta recorrente; os pagamentos já feitos guardam a própria cópia do nome e da tag. */
export function removeRecurringBillService({ id }: { id: string }) {
  return deleteDoc(doc(firestoreDb, 'recurringBills', id));
}
