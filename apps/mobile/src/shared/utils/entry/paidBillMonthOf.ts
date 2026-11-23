import type { IOwnedPaymentEntry } from '@/shared/types/entry/OwnedPaymentEntry';

/** O mês da conta que o pagamento pagou, 'AAAA-MM': o pagamento atrasado conta no mês em que foi feito, e a conta é de um mês anterior. */
export function paidBillMonthOf(entry: IOwnedPaymentEntry) {
  return entry.kind === 'overduePayment' ? entry.billMonth : entry.month;
}
