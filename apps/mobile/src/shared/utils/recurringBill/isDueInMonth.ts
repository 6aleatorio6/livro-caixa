import { dueDateInMonth } from './dueDateInMonth';

/** Se a conta aparece como a pagar no mês ('AAAA-MM'): o vencimento do mês é igual ou depois do início da conta. */
export function isDueInMonth({ dayOfMonth, startsOn }: { dayOfMonth: number; startsOn: string }, month: string) {
  return dueDateInMonth(dayOfMonth, month) >= startsOn;
}
