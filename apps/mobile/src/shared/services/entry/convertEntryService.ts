import { collection, deleteField, doc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { deleteReceiptFromBatch } from '@/shared/services/entry/deleteReceiptFromBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';

/**
 * Transforma, num lote só, um lançamento de quem está logado no outro tipo. O pagamento vira uma contribuição no
 * mesmo mês: o documento do pagamento perde o dono (fica o pagamento sem dono, que a contribuição recebe) e a
 * contribuição nasce com o valor e o comprovante. A contribuição de um mês sem pagamento com dono vira o pagamento:
 * o pagamento sem dono ganha o dono, o valor e o comprovante, e a contribuição sai. O comprovante passa de um para o
 * outro; com um novo (falha ao ler: `RECEIPT_UNREADABLE`, nada muda), o antigo sai no mesmo lote. A recusa das regras
 * (o mês já tem dono, ou o lançamento mudou no meio) lança `ENTRY_CONVERT_DENIED`.
 */
export async function convertEntryService({ entry, amountCents, receipt }: IConvertEntryInput) {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Não há sessão para transformar o lançamento');

  const batch = writeBatch(firestoreDb);
  let receiptFileId = entry.receiptFileId;
  if (receipt) {
    receiptFileId = await addReceiptToBatch(batch, receipt, uid);
    deleteReceiptFromBatch(batch, entry.receiptFileId);
  }

  if (entry.kind === 'recurringPayment') {
    batch.update(doc(firestoreDb, 'entries', entry.id), {
      paidBy: deleteField(),
      amountCents: deleteField(),
      receiptFileId: deleteField(),
    });
    batch.set(doc(collection(firestoreDb, 'entries')), {
      kind: 'contribution',
      month: entry.month,
      entryId: entry.id,
      amountCents,
      paidBy: uid,
      createdAt: serverTimestamp(),
      receiptFileId,
    });
  } else {
    batch.update(doc(firestoreDb, 'entries', entry.entryId), {
      paidBy: uid,
      amountCents,
      receiptFileId,
      createdAt: serverTimestamp(),
    });
    batch.delete(doc(firestoreDb, 'entries', entry.id));
  }

  try {
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError('Entry convert denied', 'Não deu para transformar o lançamento.', 'ENTRY_CONVERT_DENIED');
    }
    throw error;
  }
}
