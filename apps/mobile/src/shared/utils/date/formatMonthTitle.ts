import { monthName } from './monthName';

/** O título do mês: '2026-10' vira 'Outubro de 2026'. */
export function formatMonthTitle(month: string) {
  const name = monthName(month);

  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${month.slice(0, 4)}`;
}
