import { paymentMinimumCents } from '@/shared/utils/entry/paymentMinimumCents';

/** O valor fica abaixo de 30% do previsto do mês: o registro só pode ser uma contribuição. */
export function isContributionOnly(amountCents: number | null, expectedCents: number) {
  return amountCents !== null && amountCents < paymentMinimumCents(expectedCents);
}
