import { collection, doc, getDoc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IContributionInput } from '@/shared/types/entry/ContributionInput';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';
import { paymentCopiesOf } from '@/shared/utils/recurringBill/paymentCopiesOf';

/**
 * Registra a contribuição de quem está logado num lançamento, ou num mês de conta recorrente ainda a pagar. No mês, o
 * alvo é o pagamento do mês (`{mês}_{conta}`): o serviço o lê e, sem ele, grava no mesmo lote o pagamento sem dono,
 * com as cópias da conta. O lote leva também o comprovante (falha ao ler: `RECEIPT_UNREADABLE`, nada gravado), a
 * contribuição, com id gerado, e o `hasEntries: true`. A recusa das regras (o lançamento sumiu, ou outro membro gravou
 * o mês no meio) lança `CONTRIBUTION_DENIED`: tentar de novo encontra o mês como ficou.
 */
export async function addContributionService({ target, amountCents, receipt }: IContributionInput) {
  const { uid, email } = firebaseAuth.currentUser ?? {};
  if (!uid || !email) throw new Error('Não há sessão para registrar a contribuição');

  const batch = writeBatch(firestoreDb);
  let entryId: string;
  let month: string;
  if ('entry' in target) {
    ({ id: entryId, month } = target.entry);
  } else {
    ({ month } = target);
    entryId = `${month}_${target.bill.id}`;
    const paymentRef = doc(firestoreDb, 'entries', entryId);
    if (!(await getDoc(paymentRef)).exists()) {
      batch.set(paymentRef, { ...paymentCopiesOf(target.bill, month), createdAt: serverTimestamp() });
    }
  }

  const receiptFileId = await addReceiptToBatch(batch, receipt, uid);
  batch.set(doc(collection(firestoreDb, 'entries')), {
    kind: 'contribution',
    month,
    entryId,
    amountCents,
    paidBy: uid,
    createdAt: serverTimestamp(),
    receiptFileId,
  });
  batch.update(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), { hasEntries: true });
  try {
    await batch.commit();
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new AppError(
        'Contribution denied',
        'Não deu para registrar a contribuição. Tente de novo.',
        'CONTRIBUTION_DENIED',
      );
    }
    throw error;
  }
}
