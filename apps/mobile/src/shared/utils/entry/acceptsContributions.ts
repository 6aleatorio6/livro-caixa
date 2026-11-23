import type { IOverduePaymentEntry } from '@/shared/types/entry/OverduePaymentEntry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

/** O lançamento recebe contribuições: todos os que têm dono, menos o pagamento de uma conta atrasada, que as regras recusam. */
export function acceptsContributions(entry: IOwnedEntry): entry is Exclude<IOwnedEntry, IOverduePaymentEntry> {
  return entry.kind !== 'overduePayment';
}
