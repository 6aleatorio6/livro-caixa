import { deleteDoc, doc } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Desfaz o pulo: apaga o `billMonths` `skipped` de id `id`, e o mês volta a ser uma conta atrasada. O mês que já não
 * existe (o segundo Desfazer, ou outro membro desfez antes) termina sem erro. Se outro membro pagou o mês pulado no meio
 * disso, ele virou `paidLater`, a regra recusa a exclusão e o serviço lança `UNDO_SKIP_DENIED`.
 */
export async function undoSkipBillMonthService({ id }: { id: string }) {
  try {
    await deleteDoc(doc(firestoreDb, 'billMonths', id));
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
