import { deleteField, doc, updateDoc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';

/**
 * Qualquer membro altera uma conta recorrente. Usa `updateDoc`, que falha (`not-found`) se outro
 * membro excluiu a conta no meio do caminho, em vez de recriá-la; a conta sem tag perde o campo
 * `tagId` que tinha. Não apara: quem chama apara.
 */
export async function updateRecurringBillService({ id, tagId, ...bill }: IRecurringBillInput & Pick<IRecurringBill, 'id'>) {
  await updateDoc(doc(firestoreDb, 'recurringBills', id), { ...bill, tagId: tagId ?? deleteField() });
}
