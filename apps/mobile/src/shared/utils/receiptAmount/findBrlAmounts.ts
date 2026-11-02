import { brlCents } from './brlCents';

// O `R$` seguido do número com vírgula e dois centavos, com ou sem o ponto de milhar e o espaço.
const BRL_AMOUNT = /R\$\s*(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})\b/g;

/** Os valores em reais do texto, em centavos e na ordem em que aparecem. Número sem `R$` não é valor. */
export function findBrlAmounts(text: string): number[] {
  return Array.from(text.matchAll(BRL_AMOUNT), ([, reais, cents]) => brlCents(reais, cents));
}
