import { monthName } from '@/shared/utils/date/monthName';

/** O texto do selo de uma conta que é de outro mês, para o mês ('AAAA-MM') dela: '2026-10' vira "De outubro". */
export function fromMonthLabelOf(month: string) {
  return `De ${monthName(month)}`;
}
