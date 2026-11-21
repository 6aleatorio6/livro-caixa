import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { isOwnedEntry } from '@/shared/utils/entry/isOwnedEntry';
import { isUnownedPayment } from '@/shared/utils/entry/isUnownedPayment';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { dueDateInMonth } from '@/shared/utils/recurringBill/dueDateInMonth';
import { isDueInMonth } from '@/shared/utils/recurringBill/isDueInMonth';

import type { IBillToPay } from '../types/BillToPay';

/**
 * As contas a pagar do mês ('AAAA-MM'), pelo vencimento: as que vencem no mês e ainda não têm o pagamento com dono nem
 * as contribuições até o previsto do mês, que é o do pagamento sem dono (o da primeira contribuição) e não o da conta,
 * e que não têm um mês de conta (`billMonths`, pulado ou pago depois). Cada uma conta pelo que falta. Não marca a
 * atrasada: `overdue` é de quem escolhe o mês.
 */
export function billsToPayOf({
  month,
  bills,
  entries,
  billMonths,
}: {
  month: string;
  bills: IRecurringBill[];
  entries: IEntry[];
  billMonths: IBillMonth[];
}): IBillToPay[] {
  const monthEntries = entries.filter((entry) => entry.month === month);
  const unownedByBillId = new Map(
    monthEntries.filter(isUnownedPayment).map((payment) => [payment.recurringBillId, payment]),
  );
  const settledBillIds = new Set(
    billMonths.filter((billMonth) => billMonth.month === month).map(({ recurringBillId }) => recurringBillId),
  );
  // Só o pagamento da conta do mês a marca como paga: o pagamento atrasado é de um mês anterior e não marca.
  const paidBillIds = new Set(
    monthEntries.flatMap((entry) =>
      entry.kind === 'recurringPayment' &&
      (isOwnedEntry(entry) || (isUnownedPayment(entry) && isFullyContributed(entry, monthEntries)))
        ? [entry.recurringBillId]
        : [],
    ),
  );

  return bills
    .filter((bill) => isDueInMonth(bill, month) && !paidBillIds.has(bill.id) && !settledBillIds.has(bill.id))
    .map((bill): IBillToPay => {
      const payment = unownedByBillId.get(bill.id) ?? null;
      const contributions = payment ? contributionsOf(payment.id, monthEntries) : [];
      const expectedCents = payment?.expectedAmountCents ?? bill.expectedAmountCents;
      const dueDate = dueDateInMonth(payment?.dueDay ?? bill.dayOfMonth, month);
      // O mês com contribuições não segue mais a conta: o nome e a tag são as cópias do pagamento sem dono.
      const copies = payment ? { name: payment.name, tagId: payment.tagId } : { name: bill.name, tagId: bill.tagId };
      return {
        bill,
        month,
        ...copies,
        dueDate,
        payment,
        contributions,
        remainingCents: expectedCents - sumCents(contributions),
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.bill.name.localeCompare(b.bill.name));
}
