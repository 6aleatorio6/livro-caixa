/** O menor valor que ainda pode ser um pagamento: 30% do previsto do mês. Abaixo dele, o registro é uma contribuição. */
export function paymentMinimumCents(expectedCents: number) {
  return Math.ceil((expectedCents * 3) / 10);
}
