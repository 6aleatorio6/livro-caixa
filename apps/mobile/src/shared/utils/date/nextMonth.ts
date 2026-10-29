import { currentMonth } from './currentMonth';
import { shiftMonth } from './shiftMonth';

/** O mês seguinte ao atual, 'AAAA-MM': o último que a troca de mês mostra e o último que se paga. */
export function nextMonth() {
  return shiftMonth(currentMonth(), 1);
}
