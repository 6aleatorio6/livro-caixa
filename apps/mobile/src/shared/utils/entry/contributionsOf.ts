import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IEntry } from '@/shared/types/entry/Entry';

/**
 * As contribuições que o lançamento `entryId` recebeu, da mais antiga para a mais nova ("Bruno e Carla", na ordem em que
 * contribuíram): a leitura do mês as traz da mais nova para a mais antiga.
 */
export function contributionsOf(entryId: string, entries: IEntry[]): IContributionEntry[] {
  return entries
    .filter((entry): entry is IContributionEntry => entry.kind === 'contribution' && entry.entryId === entryId)
    .reverse();
}
