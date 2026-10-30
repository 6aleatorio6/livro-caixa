import type { IEntry } from '@/shared/types/entry/Entry';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';

/**
 * O detalhe da linha de um lançamento em Pagamentos, sem quem pagou (o chip marcado diz) nem a tag (o grupo diz): o
 * pagamento, "pago em 05/10" (e o previsto, quando o pago foi outro valor); a conta avulsa, "12/10 · avulsa".
 */
export function paymentEntrySupportOf(entry: IEntry) {
  const parts =
    entry.kind === 'recurringPayment'
      ? [`pago em ${formatDayMonth(entry.paidOn)}`, paymentTailOf(entry)]
      : [formatDayMonth(entry.date), 'avulsa'];

  return parts.filter(Boolean).join(' · ');
}
