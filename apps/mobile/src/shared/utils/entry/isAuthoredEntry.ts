import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IEntry } from '@/shared/types/entry/Entry';

/** O lançamento tem autor, valor e comprovante: não é o pagamento sem dono. */
export function isAuthoredEntry(entry: IEntry): entry is IAuthoredEntry {
  return entry.paidBy !== null;
}
