import { doc, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { deleteReceiptFromBatch } from '@/shared/services/entry/deleteReceiptFromBatch';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Exclui um lançamento de quem está logado: um lote apaga o lançamento, o registro e o conteúdo do comprovante
 * (`files/{receiptFileId}` e `fileContents/{receiptFileId}`). A recusa das regras (outra pessoa) lança
 * `ENTRY_DELETE_DENIED` e nada muda.
 */
export async function deleteEntryService(entry: IEntry) {
  const batch = writeBatch(firestoreDb);
  batch.delete(doc(firestoreDb, 'entries', entry.id));
  deleteReceiptFromBatch(batch, entry.receiptFileId);
  try {
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry delete denied', 'Não deu para excluir o lançamento.', 'ENTRY_DELETE_DENIED');
    }
    throw error;
  }
}
