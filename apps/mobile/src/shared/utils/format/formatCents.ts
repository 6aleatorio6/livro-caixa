/**
 * O valor em centavos em reais, escrito à mão (sem Intl, que muda entre o Hermes e o Node): 11990 vira "R$ 119,90" e
 * -1265 vira "-R$ 12,65".
 */
export function formatCents(cents: number) {
  const sign = cents < 0 ? '-' : '';
  const absoluteCents = Math.abs(cents);
  const reais = String(Math.floor(absoluteCents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(absoluteCents % 100).padStart(2, '0');

  return `${sign}R$ ${reais},${centavos}`;
}
