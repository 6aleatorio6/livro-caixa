import type { IEntry } from '@/shared/types/entry/Entry';
import { dayOf } from '@/shared/utils/date/dayOf';

/** O dia da linha paga: o do vencimento guardado no pagamento e o da data na conta avulsa. */
const rowDayOf = (entry: IEntry) => (entry.kind === 'oneOffBill' ? dayOf(entry.date) : entry.dueDay);

/** As linhas pagas do mês na ordem da lista do Início: pelo dia, e no mesmo dia pelo nome. */
export function paidRowsOf(paid: IEntry[]) {
  return [...paid].sort((a, b) => rowDayOf(a) - rowDayOf(b) || a.name.localeCompare(b.name));
}
