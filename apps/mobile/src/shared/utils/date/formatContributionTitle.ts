import { monthName } from './monthName';

/** O título da contribuição numa conta do mês: '2026-10' vira 'Contribuição em outubro de 2026'. */
export function formatContributionTitle(month: string) {
  return `Contribuição em ${monthName(month)} de ${month.slice(0, 4)}`;
}
