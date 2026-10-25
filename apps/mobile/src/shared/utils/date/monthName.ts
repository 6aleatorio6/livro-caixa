const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** O nome do mês em minúsculas, escrito à mão (sem Intl, que muda entre o Hermes e o Node): '2026-10' vira 'outubro'. */
export function monthName(month: string) {
  return MONTH_NAMES[Number(month.slice(5, 7)) - 1];
}
