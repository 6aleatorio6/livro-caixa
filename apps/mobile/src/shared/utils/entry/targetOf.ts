import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IEntry } from '@/shared/types/entry/Entry';

/** O lançamento que a contribuição recebe, entre os do mês; `undefined` se ele não está entre eles. */
export function targetOf(contribution: IContributionEntry, entries: IEntry[]) {
  return entries.find(
    (entry): entry is IBillEntry => entry.id === contribution.entryId && entry.kind !== 'contribution',
  );
}
