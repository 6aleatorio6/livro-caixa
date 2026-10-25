import { monthOf } from './monthOf';
import { toIsoDate } from './toIsoDate';

/** O mês atual pelos campos locais, 'AAAA-MM'. */
export function currentMonth() {
  return monthOf(toIsoDate(new Date()));
}
