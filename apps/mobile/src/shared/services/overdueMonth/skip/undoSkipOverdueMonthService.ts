import { deleteDoc } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { overdueMonthRef } from '@/shared/services/overdueMonth/overdueMonthRef';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Desfaz o pulo: apaga o `overdueMonths` `skipped` do mês da conta, e o mês volta a ser uma conta atrasada. O mês que já
 * não existe (o segundo Desfazer, ou outro membro desfez antes) termina sem erro. Se outro membro pagou o mês pulado no
 * meio disso, ele virou `paidLater`, a regra recusa a exclusão e o serviço lança `UNDO_SKIP_DENIED`.
 */
export async function undoSkipOverdueMonthService({ bill, month }: { bill: IRecurringBill; month: string }) {
  try {
    await deleteDoc(overdueMonthRef(month, bill.id));
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError(
        'Bill month undo skip denied',
        'Não deu para desfazer o pulo. A conta já foi paga.',
        'UNDO_SKIP_DENIED',
      );
    }
    throw error;
  }
}
