import { deleteField, doc, updateDoc, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { deleteReceiptFromBatch } from '@/shared/services/entry/deleteReceiptFromBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import { monthOf } from '@/shared/utils/date/monthOf';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Altera um lançamento de quem está logado. O pagamento muda o valor; a conta avulsa, o nome, o valor, a data (o
 * `month` sai dela) e a tag (`null` tira o campo). Sem comprovante novo é um `updateDoc`. Com ele, lê o
 * arquivo (falha: `RECEIPT_UNREADABLE`, nada muda) e grava num lote só o registro e o conteúdo novos, o lançamento
 * com o `receiptFileId` novo e a exclusão do registro e do conteúdo antigos. A recusa das regras (outra pessoa, ou o lançamento já
 * excluído) lança `ENTRY_CHANGE_DENIED`.
 */
export async function updateEntryService({ entry, changes, receipt }: IUpdateEntryInput) {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Não há sessão para alterar o lançamento');

  const entryRef = doc(firestoreDb, 'entries', entry.id);
  const fields =
    entry.kind === 'oneOffBill' && 'name' in changes
      ? {
          name: changes.name,
          amountCents: changes.amountCents,
          date: changes.date,
          month: monthOf(changes.date),
          tagId: changes.tagId ?? deleteField(),
        }
      : { amountCents: changes.amountCents };

  try {
    if (!receipt) {
      await updateDoc(entryRef, fields);
      return;
    }

    const batch = writeBatch(firestoreDb);
    const receiptFileId = await addReceiptToBatch(batch, receipt, uid);
    batch.update(entryRef, { ...fields, receiptFileId });
    deleteReceiptFromBatch(batch, entry.receiptFileId);
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry change denied', 'Não deu para salvar as alterações.', 'ENTRY_CHANGE_DENIED');
    }
    throw error;
  }
}
