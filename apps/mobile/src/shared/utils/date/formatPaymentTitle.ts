import { monthName } from './monthName';

/** O título do pagamento de uma conta no mês: '2026-10' vira 'Pagamento de outubro de 2026'. */
export function formatPaymentTitle(month: string) {
  return `Pagamento de ${monthName(month)} de ${month.slice(0, 4)}`;
}
