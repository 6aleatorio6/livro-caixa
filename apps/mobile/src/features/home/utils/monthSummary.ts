import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { dueDateInMonth } from '@/shared/utils/recurringBill/dueDateInMonth';
import { isDueInMonth } from '@/shared/utils/recurringBill/isDueInMonth';
import { totalExpectedCents } from '@/shared/utils/recurringBill/totalExpectedCents';

import type { IMonthSummary } from '../types/MonthSummary';

/**
 * Calcula o mês ('AAAA-MM') da família. Uma conta recorrente que vence no mês e não tem pagamento
 * está a pagar, pelo valor previsto; os lançamentos do mês (pagamentos e avulsas) estão pagos.
 * Não olha quem está logado.
 */
export function monthSummary({ month, bills, entries }: { month: string; bills: IRecurringBill[]; entries: IEntry[] }): IMonthSummary {
  const paid = entries.filter((entry) => entry.month === month);
  const paidBillIds = new Set(paid.flatMap((entry) => (entry.kind === 'recurringPayment' ? [entry.recurringBillId] : [])));

  const toPay = bills
    .filter((bill) => isDueInMonth(bill, month) && !paidBillIds.has(bill.id))
    .map((bill) => ({ bill, dueDate: dueDateInMonth(bill.dayOfMonth, month) }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.bill.name.localeCompare(b.bill.name));

  const toPayCents = totalExpectedCents(toPay.map(({ bill }) => bill));
  const paidCents = paid.reduce((total, entry) => total + entry.amountCents, 0);

  return { toPay, paid, toPayCents, paidCents, totalCents: paidCents + toPayCents, billCount: toPay.length + paid.length };
}
