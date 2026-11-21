import { FIRST_MONTH } from '@/shared/constants/date/firstMonth';
import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

import type { IBillToPay } from '../types/BillToPay';
import { billsToPayOf } from './billsToPayOf';

/**
 * As contas atrasadas no mês atual (`currentMonth`, 'AAAA-MM'): as que ficaram a pagar em cada mês anterior a ele, do
 * mais antigo ao mais novo, a partir do primeiro mês do app, com os lançamentos e os meses de conta (pulados ou pagos
 * depois) de cada mês. A atrasada com contribuições continua com o que falta e o pagamento sem dono, que é pago no mês
 * dela.
 */
export function overdueBillsOf({
  bills,
  entries,
  billMonths,
  currentMonth,
}: {
  bills: IRecurringBill[];
  entries: IEntry[];
  billMonths: IBillMonth[];
  currentMonth: string;
}): IBillToPay[] {
  const overdueBills: IBillToPay[] = [];
  for (let month = FIRST_MONTH; month < currentMonth; month = shiftMonth(month, 1)) {
    overdueBills.push(
      ...billsToPayOf({ month, bills, entries, billMonths }).map((billToPay): IBillToPay => ({
        ...billToPay,
        overdue: 'fromEarlierMonth',
      })),
    );
  }
  return overdueBills;
}
