import { addDoc, collection } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';

/**
 * Qualquer membro adiciona uma conta recorrente; o id é gerado pelo Firestore. Sem tag, o campo
 * `tagId` não é gravado. Não apara: quem chama apara.
 */
export async function addRecurringBillService({ tagId, ...bill }: IRecurringBillInput) {
  await addDoc(collection(firestoreDb, 'recurringBills'), tagId ? { ...bill, tagId } : bill);
}
