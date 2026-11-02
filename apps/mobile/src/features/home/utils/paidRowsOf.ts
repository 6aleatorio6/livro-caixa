import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { dayOf } from '@/shared/utils/date/dayOf';

/** O dia da linha paga: o do vencimento guardado no pagamento e o da data na conta avulsa. */
const rowDayOf = (entry: IOwnedEntry) => (entry.kind === 'oneOffBill' ? dayOf(entry.date) : entry.dueDay);

/** As linhas pagas do mês na ordem da lista do Início: pelo dia, e no mesmo dia pelo nome. */
export function paidRowsOf(paid: IOwnedEntry[]) {
  return [...paid].sort((a, b) => rowDayOf(a) - rowDayOf(b) || a.name.localeCompare(b.name));
}
