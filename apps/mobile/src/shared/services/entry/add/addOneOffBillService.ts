import { collection, doc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import { monthOf } from '@/shared/utils/date/monthOf';

/**
 * Registra uma conta avulsa já paga por quem está logado: grava num lote só o registro e o conteúdo do
 * comprovante (`files/{id}` e `fileContents/{id}`), o lançamento e o `hasEntries: true` da própria entrada na
 * lista. O arquivo do aparelho que não pode ser lido lança `RECEIPT_UNREADABLE`, e nada é gravado. Sem tag, o
 * lançamento não tem o campo `tagId`. Não apara o nome: quem chama apara.
 */
export async function addOneOffBillService({ name, amountCents, date, tagId, receipt }: IOneOffBillInput) {
  const { uid, email } = firebaseAuth.currentUser ?? {};
  if (!uid || !email) throw new Error('Não há sessão para registrar a conta avulsa');

  const batch = writeBatch(firestoreDb);
  const receiptFileId = await addReceiptToBatch(batch, receipt, uid);
  batch.set(doc(collection(firestoreDb, 'entries')), {
    kind: 'oneOffBill',
    month: monthOf(date),
    name,
    amountCents,
    date,
    ...(tagId && { tagId }),
    paidBy: uid,
    createdAt: serverTimestamp(),
    receiptFileId,
  });
  batch.update(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), { hasEntries: true });
  await batch.commit();
}
