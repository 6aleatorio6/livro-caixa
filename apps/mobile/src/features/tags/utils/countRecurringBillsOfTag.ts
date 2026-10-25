import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** Quantas contas recorrentes usam a tag. As contas avulsas entram aqui quando existirem. */
export function countRecurringBillsOfTag(bills: IRecurringBill[], tagId: string) {
  return bills.filter((bill) => bill.tagId === tagId).length;
}
