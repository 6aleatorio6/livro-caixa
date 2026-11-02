import { doc, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { deleteReceiptFromBatch } from '@/shared/services/entry/deleteReceiptFromBatch';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isUnownedPayment } from '@/shared/utils/entry/isUnownedPayment';
import { targetOf } from '@/shared/utils/entry/targetOf';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Exclui um lançamento de quem está logado: um lote apaga o lançamento, o registro e o conteúdo do comprovante
 * (`files/{receiptFileId}` e `fileContents/{receiptFileId}`). Na última contribuição de um pagamento sem dono, o lote
 * apaga também o pagamento, e o mês volta a seguir a conta: o serviço sabe disso pelos lançamentos do mês que a tela
 * leu (`monthEntries`). A recusa das regras (outra pessoa) lança `ENTRY_DELETE_DENIED` e nada muda.
 */
export async function deleteEntryService(entry: IAuthoredEntry, monthEntries: IEntry[] = []) {
  const batch = writeBatch(firestoreDb);
  batch.delete(doc(firestoreDb, 'entries', entry.id));
  deleteReceiptFromBatch(batch, entry.receiptFileId);
  if (entry.kind === 'contribution' && isLastOfUnownedPayment(entry, monthEntries)) {
    batch.delete(doc(firestoreDb, 'entries', entry.entryId));
  }
  try {
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry delete denied', 'Não deu para excluir o lançamento.', 'ENTRY_DELETE_DENIED');
    }
    throw error;
  }
}

/** A contribuição é a única que resta num pagamento sem dono. */
function isLastOfUnownedPayment(contribution: IContributionEntry, monthEntries: IEntry[]) {
  const target = targetOf(contribution, monthEntries);
  return (
    target !== undefined &&
    isUnownedPayment(target) &&
    contributionsOf(target.id, monthEntries).every(({ id }) => id === contribution.id)
  );
}
