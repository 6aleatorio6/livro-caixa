import { collection, doc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { overdueMonthRef } from '@/shared/services/overdueMonth/overdueMonthRef';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IOverduePaymentInput } from '@/shared/types/entry/OverduePaymentInput';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';
import { paymentCopiesOf } from '@/shared/utils/recurringBill/paymentCopiesOf';

/**
 * Registra, no mês de hoje, o pagamento de um mês atrasado de uma conta recorrente por quem está logado. Lê o comprovante
 * (falha: `RECEIPT_UNREADABLE`, nada gravado) e grava num lote só o registro e o conteúdo do arquivo, o `overduePayment`
 * (id gerado, com as cópias da conta e o dia do vencimento no mês dela), o `overdueMonths` `paidLater` que aponta para ele e
 * o `hasEntries: true`. O `overdueMonths` é um `set`: cria o documento de um mês sem estado ou troca o `skipped` de um mês
 * pulado. Se o mês já foi pago depois (por outro membro) ou tem pagamento, a regra recusa o lote
 * (`firestore/permission-denied`) e o serviço lança `ALREADY_SETTLED`.
 */
export async function payOverdueBillService({ bill, billMonth, amountCents, receipt }: IOverduePaymentInput) {
  const { uid, email } = firebaseAuth.currentUser ?? {};
  if (!uid || !email) throw new Error('Não há sessão para registrar o pagamento da conta atrasada');

  const batch = writeBatch(firestoreDb);
  const receiptFileId = await addReceiptToBatch(batch, receipt, uid);
  const entryRef = doc(collection(firestoreDb, 'entries'));
  batch.set(entryRef, {
    ...paymentCopiesOf(bill, billMonth),
    kind: 'overduePayment',
    month: currentMonth(),
    billMonth,
    amountCents,
    paidBy: uid,
    createdAt: serverTimestamp(),
    receiptFileId,
  });
  batch.set(overdueMonthRef(billMonth, bill.id), {
    status: 'paidLater',
    month: billMonth,
    recurringBillId: bill.id,
    entryId: entryRef.id,
    name: bill.name,
    ...(bill.tagId && { tagId: bill.tagId }),
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), { hasEntries: true });
  try {
    await batch.commit();
  } catch (error) {
    // O app só oferece o pagamento de um mês atrasado de uma conta que existe, então a recusa é o mês já resolvido: outro
    // membro o pagou, ou ele ganhou um pagamento (a regra recusa o `set` sobre um `paidLater`).
    if (isPermissionDenied(error)) {
      throw new AppError('Bill month already settled', 'Esta conta já foi paga ou pulada.', 'ALREADY_SETTLED');
    }
    throw error;
  }
}
