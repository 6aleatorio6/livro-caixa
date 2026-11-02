import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';

/** O lançamento que alguém registrou com valor e comprovante: a conta avulsa ou o pagamento com dono. */
export type IOwnedEntry = Exclude<IEntry, IUnownedPaymentEntry | IContributionEntry>;
