import { doc, getDoc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import { isPermissionDenied } from '@/shared/utils/handlerError/isPermissionDenied';
import { paymentCopiesOf } from '@/shared/utils/recurringBill/paymentCopiesOf';

/**
 * Registra o pagamento de uma conta recorrente num mês por quem está logado. O lançamento tem o id
 * `{mês}_{conta}`, então o mês só é pago uma vez: o serviço lê esse documento antes de tudo e, se ele
 * é um pagamento com dono, lança `ALREADY_PAID` sem gravar nada (a regra também recusaria o segundo lote). Senão lê o
 * comprovante (falha: `RECEIPT_UNREADABLE`, nada gravado) e grava num lote só o registro e o conteúdo do arquivo, o
 * lançamento e o `hasEntries: true`. Sem documento, o lançamento nasce com o nome, a tag, o dia do vencimento no mês e
 * o valor previsto copiados da conta, que pode mudar ou sumir depois. Com o pagamento sem dono de um mês com
 * contribuições, o mesmo documento ganha o dono, o valor, o comprovante e a hora, e as cópias dele ficam. Se outro
 * membro paga o mês no meio disso, a regra recusa o lote (`firestore/permission-denied`) e o serviço lança o mesmo
 * `ALREADY_PAID`.
 */
export async function payRecurringBillService({ bill, month, amountCents, receipt }: IRecurringPaymentInput) {
  const { uid, email } = firebaseAuth.currentUser ?? {};
  if (!uid || !email) throw new Error('Não há sessão para registrar o pagamento da conta');

  const entryRef = doc(firestoreDb, 'entries', `${month}_${bill.id}`);
  const current = await getDoc(entryRef);
  if (current.exists() && current.data()?.paidBy !== undefined) {
    throw alreadyPaid();
  }

  const batch = writeBatch(firestoreDb);
  const receiptFileId = await addReceiptToBatch(batch, receipt, uid);
  const owner = { amountCents, paidBy: uid, createdAt: serverTimestamp(), receiptFileId };
  if (current.exists()) {
    batch.update(entryRef, owner);
  } else {
    batch.set(entryRef, { ...paymentCopiesOf(bill, month), ...owner });
  }
  batch.update(doc(firestoreDb, 'allowedEmails', allowedEmailId(email)), { hasEntries: true });
  try {
    await batch.commit();
  } catch (error) {
    // A corrida: outro membro gravou o mês depois da leitura acima, e a regra recusa o lote (vira um `update`).
    // O app só oferece o pagamento de uma conta que existe e vence no mês, então a recusa é essa corrida.
    if (isPermissionDenied(error)) throw alreadyPaid();
    throw error;
  }
}

function alreadyPaid() {
  return new AppError('Bill already paid this month', 'Esta conta já foi paga neste mês.', 'ALREADY_PAID');
}
