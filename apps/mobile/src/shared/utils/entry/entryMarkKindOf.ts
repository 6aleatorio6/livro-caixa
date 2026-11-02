import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IEntryMarkKind } from '@/shared/types/entry/EntryMarkKind';

/** A marca da linha de uma conta: a conta avulsa, o pagamento ou a conta paga só pelas contribuições. */
export function entryMarkKindOf(entry: IBillEntry): IEntryMarkKind {
  if (entry.kind === 'oneOffBill') return 'oneOff';
  return entry.paidBy === null ? 'paidByContributions' : 'payment';
}
