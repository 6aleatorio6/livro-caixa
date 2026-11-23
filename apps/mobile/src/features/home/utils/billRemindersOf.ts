import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { fromIsoDate } from '@/shared/utils/date/fromIsoDate';
import { formatCents } from '@/shared/utils/format/formatCents';

import type { IBillReminder } from '../types/BillReminder';
import { billsToPayOf } from './billsToPayOf';

const REMINDER_HOUR = 9;

/**
 * Os lembretes das contas a pagar dos meses ('AAAA-MM', em geral o atual e o seguinte): um por conta, às 9h da véspera
 * do vencimento, com o que falta pagar. Sai o lembrete cuja hora já passou em `now`. Os meses de conta (pulado ou pago
 * depois) não entram: pular só vale para uma conta atrasada, e a atrasada não tem véspera a lembrar.
 */
export function billRemindersOf({
  now,
  months,
  bills,
  entries,
}: {
  now: Date;
  months: string[];
  bills: IRecurringBill[];
  entries: IEntry[];
}): IBillReminder[] {
  return months
    .flatMap((month) => billsToPayOf({ month, bills, entries, overdueMonths: [] }))
    .map(({ bill, month, name, dueDate, remainingCents }): IBillReminder => {
      const date = fromIsoDate(dueDate);
      date.setDate(date.getDate() - 1);
      date.setHours(REMINDER_HOUR, 0, 0, 0);

      return {
        identifier: `${month}_${bill.id}`,
        title: `${name} vence amanhã`,
        body: `${formatCents(remainingCents)}, ainda a pagar`,
        date,
      };
    })
    .filter(({ date }) => date > now);
}
