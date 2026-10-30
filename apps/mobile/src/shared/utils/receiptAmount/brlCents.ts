/** Os centavos de um valor em reais lido em duas partes: os reais, com ou sem o ponto de milhar, e os dois dígitos. */
export function brlCents(reais: string, cents: string): number {
  return Number(reais.replaceAll('.', '')) * 100 + Number(cents);
}
