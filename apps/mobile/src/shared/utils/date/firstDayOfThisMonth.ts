import { toIsoDate } from './toIsoDate';

/** O primeiro dia do mês atual, 'AAAA-MM-DD': a conta nova já vale neste mês, com o vencimento que ele tiver. */
export function firstDayOfThisMonth() {
  const today = new Date();

  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));
}
