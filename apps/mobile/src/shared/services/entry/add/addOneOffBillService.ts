import { collection, doc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';
import { putFile, ref } from '@react-native-firebase/storage';

import { AppError } from '@/shared/exceptions/AppError';
import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import { monthOf } from '@/shared/utils/date/monthOf';

/**
 * Registra uma conta avulsa já paga por quem está logado. Primeiro envia o comprovante ao Storage
 * (`files/{fileId}`); se o envio falha, lança `RECEIPT_UPLOAD_FAILED` e nada é gravado. Depois grava
 * num lote só o registro do arquivo, o lançamento e o `hasEntries: true` da própria entrada na lista.
 * Sem tag, o lançamento não tem o campo `tagId`. Não apara o nome: quem chama apara.
 */
export async function addOneOffBillService({ name, amountCents, date, tagId, receipt }: IOneOffBillInput) {
  const { uid, email } = firebaseAuth.currentUser ?? {};
  if (!uid || !email) throw new Error('Não há sessão para registrar a conta avulsa');

  const fileRef = doc(collection(firestoreDb, 'files'));
  const entryRef = doc(collection(firestoreDb, 'entries'));

  try {
    await putFile(ref(firebaseStorage, `files/${fileRef.id}`), receipt.uri, { contentType: receipt.contentType });
  } catch {
    throw new AppError(
      'Receipt upload failed',
      'Não deu para enviar o comprovante. Confira a internet e tente de novo.',
      'RECEIPT_UPLOAD_FAILED',
    );
  }

  const batch = writeBatch(firestoreDb);
  batch.set(fileRef, {
    storagePath: `files/${fileRef.id}`,
    type: receipt.type,
    contentType: receipt.contentType,
    sizeBytes: receipt.sizeBytes,
    uploadedBy: uid,
  });
  batch.set(entryRef, {
    kind: 'oneOffBill',
    month: monthOf(date),
    name,
    amountCents,
    date,
    ...(tagId && { tagId }),
    paidBy: uid,
    createdAt: serverTimestamp(),
    receiptFileId: fileRef.id,
  });
  batch.update(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), { hasEntries: true });
  await batch.commit();
}
