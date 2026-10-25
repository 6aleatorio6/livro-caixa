import { doc, writeBatch } from '@react-native-firebase/firestore';
import { deleteObject, ref } from '@react-native-firebase/storage';

import { AppError } from '@/shared/exceptions/AppError';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Exclui um lançamento de quem está logado: um lote apaga o lançamento e o registro do comprovante
 * (`files/{receiptFileId}`), e só depois o objeto do Storage. Um objeto que sobra (ou que já não existia) não
 * é erro. A recusa das regras (outra pessoa) lança `ENTRY_DELETE_DENIED` e nada muda.
 */
export async function deleteEntryService(entry: IEntry) {
  const batch = writeBatch(firestoreDb);
  batch.delete(doc(firestoreDb, 'entries', entry.id));
  batch.delete(doc(firestoreDb, 'files', entry.receiptFileId));
  try {
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry delete denied', 'Não deu para excluir o lançamento.', 'ENTRY_DELETE_DENIED');
    }
    throw error;
  }

  try {
    await deleteObject(ref(firebaseStorage, `files/${entry.receiptFileId}`));
  } catch {
    // O objeto que sobra no Storage é o órfão aceito: o lançamento já foi excluído.
  }
}
