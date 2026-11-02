import { isContributionOnly } from '@/shared/utils/entry/isContributionOnly';

/** O formulário do pagamento registra uma contribuição: com Paguei só uma parte ligado, ou abaixo de 30% do previsto. */
export function isContributionRegistration(
  { isPartial, amountCents }: { isPartial: boolean; amountCents: number | null },
  expectedCents: number,
) {
  return isPartial || isContributionOnly(amountCents, expectedCents);
}
