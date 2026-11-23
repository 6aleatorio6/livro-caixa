import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import { dayOf } from '@/shared/utils/date/dayOf';

/**
 * O dia que a linha paga mostra: o do vencimento guardado no pagamento, o da data na conta avulsa e, no pagamento
 * atrasado, o dia em que foi pago ("paga dia 5"), porque o vencimento dele é de um mês anterior.
 */
function rowDayOf(entry: IBillEntry) {
  if (entry.kind === 'oneOffBill') return dayOf(entry.date);
  if (entry.kind === 'overduePayment') return dayOf(entry.paidOn);
  return entry.dueDay;
}

/** As linhas pagas do mês na ordem da lista do Início: pelo dia, e no mesmo dia pelo nome. */
export function paidRowsOf(paid: IBillEntry[]) {
  return [...paid].sort((a, b) => rowDayOf(a) - rowDayOf(b) || a.name.localeCompare(b.name));
}
