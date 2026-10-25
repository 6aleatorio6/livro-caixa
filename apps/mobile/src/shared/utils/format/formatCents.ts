/** O valor em centavos em reais, escrito à mão (sem Intl, que muda entre o Hermes e o Node): 11990 vira "R$ 119,90". */
export function formatCents(cents: number) {
  const reais = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(cents % 100).padStart(2, '0');

  return `R$ ${reais},${centavos}`;
}
