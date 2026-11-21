import { serverTimestamp, setDoc } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { billMonthRef } from '@/shared/services/billMonth/billMonthRef';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Pula o mês atrasado de uma conta recorrente por quem está logado: grava o `billMonths` `skipped`, que tem o id
 * `{mês}_{conta}` e guarda o nome e a tag da conta para as Puladas a mostrarem mesmo depois de excluída. A regra recusa
 * o mês que já tem pagamento (com dono ou, com contribuições, sem dono) ou estado (pago depois, ou já pulado), e o
 * serviço lança `SKIP_DENIED`.
 */
export async function skipBillMonthService({ bill, month }: { bill: IRecurringBill; month: string }) {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Não há sessão para pular o mês da conta');

  try {
    await setDoc(billMonthRef(month, bill.id), {
      status: 'skipped',
      month,
      recurringBillId: bill.id,
      name: bill.name,
      ...(bill.tagId && { tagId: bill.tagId }),
      createdBy: uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError(
        'Bill month skip denied',
        'Não deu para pular esta conta. Ela já foi paga ou tem contribuições.',
        'SKIP_DENIED',
      );
    }
    throw error;
  }
}
