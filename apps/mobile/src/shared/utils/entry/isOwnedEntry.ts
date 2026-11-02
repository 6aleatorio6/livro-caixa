import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

/** A conta avulsa ou o pagamento com dono: nem a contribuição nem o pagamento sem dono do mês com contribuições. */
export function isOwnedEntry(entry: IEntry): entry is IOwnedEntry {
  return entry.kind !== 'contribution' && entry.paidBy !== null;
}
