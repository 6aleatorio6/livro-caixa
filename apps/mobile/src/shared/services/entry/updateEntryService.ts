import { deleteField, doc, updateDoc, writeBatch } from '@react-native-firebase/firestore';
import { deleteObject, ref } from '@react-native-firebase/storage';

import { AppError } from '@/shared/exceptions/AppError';
import { uploadReceipt } from '@/shared/services/entry/uploadReceipt';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import { monthOf } from '@/shared/utils/date/monthOf';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Altera um lançamento de quem está logado. O pagamento muda o valor; a conta avulsa, o nome, o valor, a data (o
 * `month` sai dela) e a tag (`null` tira o campo). Sem comprovante novo é um `updateDoc`. Com ele, envia o
 * arquivo primeiro (falha: `RECEIPT_UPLOAD_FAILED`, nada muda) e grava num lote só o registro novo, o lançamento
 * com o `receiptFileId` novo e a exclusão do registro antigo; só então apaga o objeto antigo do Storage, e um
 * objeto que sobra (ou que já não existia) não é erro. A recusa das regras (outra pessoa, ou o lançamento já
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

    const { fileRef, fileData } = await uploadReceipt(receipt, uid);
    const batch = writeBatch(firestoreDb);
    batch.set(fileRef, fileData);
    batch.update(entryRef, { ...fields, receiptFileId: fileRef.id });
    batch.delete(doc(firestoreDb, 'files', entry.receiptFileId));
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry change denied', 'Não deu para salvar as alterações.', 'ENTRY_CHANGE_DENIED');
    }
    throw error;
  }

  try {
    await deleteObject(ref(firebaseStorage, `files/${entry.receiptFileId}`));
  } catch {
    // O objeto antigo que sobra no Storage é o mesmo órfão aceito no registro: o lançamento já foi alterado.
  }
}
