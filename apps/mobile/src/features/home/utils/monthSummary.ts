import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { isOwnedEntry } from '@/shared/utils/entry/isOwnedEntry';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { isUnownedPayment } from '@/shared/utils/entry/isUnownedPayment';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

import type { IBillToPay } from '../types/BillToPay';
import type { IMonthSummary } from '../types/MonthSummary';
import { billsToPayOf } from './billsToPayOf';

/**
 * Calcula o mês ('AAAA-MM') da família. Uma conta recorrente que vence no mês está a pagar até ter o pagamento com
 * dono ou até as contribuições alcançarem o previsto do mês, que é o do pagamento sem dono (o da primeira
 * contribuição) e não o da conta; a pagar, ela conta pelo que falta. Os lançamentos com dono e os pagamentos sem dono
 * que alcançaram o previsto estão pagos, e o pago é a soma das partes de cada membro. Não olha quem está logado.
 *
 * Um mês de conta (`overdueMonths`) tira a conta do a pagar do mês: o pulado vai para `skipped`, o pago depois só some,
 * porque o pagamento dele está no mês em que foi feito. As atrasadas dos meses anteriores (`overdueBills`, de
 * `overdueBillsOf`, que só o mês atual recebe) vêm antes das contas do mês e entram nos totais, e a conta sem
 * pagamento de um mês anterior ao atual (`currentMonth`) é a atrasada no mês dela.
 */
export function monthSummary({
  month,
  currentMonth,
  bills,
  entries,
  overdueMonths,
  overdueBills,
}: {
  month: string;
  currentMonth: string;
  bills: IRecurringBill[];
  entries: IEntry[];
  overdueMonths: IOverdueMonth[];
  overdueBills: IBillToPay[];
}): IMonthSummary {
  const monthEntries = entries.filter((entry) => entry.month === month);
  const monthOverdueMonths = overdueMonths.filter((overdueMonth) => overdueMonth.month === month);

  const paid = monthEntries.flatMap((entry) =>
    isOwnedEntry(entry) || (isUnownedPayment(entry) && isFullyContributed(entry, monthEntries)) ? [entry] : [],
  );

  const toPayOfMonth = billsToPayOf({ month, bills, entries, overdueMonths }).map((billToPay): IBillToPay =>
    month < currentMonth ? { ...billToPay, overdue: 'inItsMonth' } : billToPay,
  );
  const toPay = [...overdueBills, ...toPayOfMonth];

  const toPayCents = sumCents(toPay.map(({ remainingCents }) => ({ amountCents: remainingCents })));
  const paidCents = sumCents(memberPartsOf(monthEntries));

  return {
    toPay,
    paid,
    skipped: monthOverdueMonths.filter(({ status }) => status === 'skipped'),
    entries: monthEntries,
    toPayCents,
    paidCents,
    totalCents: paidCents + toPayCents,
    billCount: toPay.length + paid.length,
  };
}
