import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNamesOf } from '@/shared/utils/person/memberNamesOf';

/** Quanto veio de contribuições e de quem: "R$ 40,00 de Bruno", "R$ 60,00 de Bruno e Carla"; sem contribuições, nada. */
export function contributionsSupportOf(contributions: IContributionEntry[], people: IAllowedEmailListItem[]) {
  if (contributions.length === 0) return undefined;

  return `${formatCents(sumCents(contributions))} de ${memberNamesOf(
    contributions.map(({ paidBy }) => paidBy),
    people,
  )}`;
}
