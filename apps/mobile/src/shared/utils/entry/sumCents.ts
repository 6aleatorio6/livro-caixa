/** A soma dos valores, em centavos. */
export function sumCents(items: { amountCents: number }[]) {
  return items.reduce((total, { amountCents }) => total + amountCents, 0);
}
