import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

/** O lançamento que alguém registrou, com valor e comprovante, e que só ele altera ou exclui: tudo menos o pagamento sem dono. */
export type IAuthoredEntry = IOwnedEntry | IContributionEntry;
