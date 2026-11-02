import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isOwnedEntry } from '@/shared/utils/entry/isOwnedEntry';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { isUnownedPayment } from '@/shared/utils/entry/isUnownedPayment';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { dueDateInMonth } from '@/shared/utils/recurringBill/dueDateInMonth';
import { isDueInMonth } from '@/shared/utils/recurringBill/isDueInMonth';

import type { IBillToPay } from '../types/BillToPay';
import type { IMonthSummary } from '../types/MonthSummary';

/**
 * Calcula o mês ('AAAA-MM') da família. Uma conta recorrente que vence no mês está a pagar até ter o pagamento com
 * dono ou até as contribuições alcançarem o previsto do mês, que é o do pagamento sem dono (o da primeira
 * contribuição) e não o da conta; a pagar, ela conta pelo que falta. Os lançamentos com dono e os pagamentos sem dono
 * que alcançaram o previsto estão pagos, e o pago é a soma das partes de cada membro. Não olha quem está logado.
 */
export function monthSummary({
  month,
  bills,
  entries,
}: {
  month: string;
  bills: IRecurringBill[];
  entries: IEntry[];
}): IMonthSummary {
  const monthEntries = entries.filter((entry) => entry.month === month);
  const unownedByBillId = new Map(
    monthEntries.filter(isUnownedPayment).map((payment) => [payment.recurringBillId, payment]),
  );

  const paid = monthEntries.flatMap((entry) =>
    isOwnedEntry(entry) || (isUnownedPayment(entry) && isFullyContributed(entry, monthEntries)) ? [entry] : [],
  );
  const paidBillIds = new Set(
    paid.flatMap((entry) => (entry.kind === 'recurringPayment' ? [entry.recurringBillId] : [])),
  );

  const toPay = bills
    .filter((bill) => isDueInMonth(bill, month) && !paidBillIds.has(bill.id))
    .map((bill): IBillToPay => {
      const payment = unownedByBillId.get(bill.id) ?? null;
      const contributions = payment ? contributionsOf(payment.id, monthEntries) : [];
      const expectedCents = payment?.expectedAmountCents ?? bill.expectedAmountCents;
      const dueDate = dueDateInMonth(payment?.dueDay ?? bill.dayOfMonth, month);
      // O mês com contribuições não segue mais a conta: o nome e a tag são as cópias do pagamento sem dono.
      const copies = payment ? { name: payment.name, tagId: payment.tagId } : { name: bill.name, tagId: bill.tagId };
      return {
        bill,
        ...copies,
        dueDate,
        payment,
        contributions,
        remainingCents: expectedCents - sumCents(contributions),
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.bill.name.localeCompare(b.bill.name));

  const toPayCents = sumCents(toPay.map(({ remainingCents }) => ({ amountCents: remainingCents })));
  const paidCents = sumCents(memberPartsOf(monthEntries));

  return {
    toPay,
    paid,
    entries: monthEntries,
    toPayCents,
    paidCents,
    totalCents: paidCents + toPayCents,
    billCount: toPay.length + paid.length,
  };
}
