import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { isDueInMonth } from '@/shared/utils/recurringBill/isDueInMonth';

/**
 * Se a conta pode ser paga no mês que a tela recebeu: o mês é `AAAA-MM`, não passa do mês atual e a conta
 * já vence nele (o início dela é do mês ou de antes). Vem da rota, então pode ser qualquer texto, ou faltar.
 */
export function isMonthToPay(bill: IRecurringBill, month: string | undefined): month is string {
  return (
    month !== undefined &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
    month <= currentMonth() &&
    isDueInMonth(bill, month)
  );
}
