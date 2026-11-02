import type { IEntry } from '@/shared/types/entry/Entry';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';

/**
 * O detalhe da linha de um lançamento em Pagamentos, sem a tag (o grupo diz): o pagamento, "pago em 05/10" (e o
 * previsto, quando o pago foi outro valor); a conta avulsa, "12/10 · avulsa". Quem pagou entra só no chip "Todos"
 * ("pago em 05/10 · Ana"): nos outros, o chip marcado já diz.
 */
export function paymentEntrySupportOf(entry: IEntry, memberName?: string) {
  const parts =
    entry.kind === 'recurringPayment'
      ? [`pago em ${formatDayMonth(entry.paidOn)}`, memberName, paymentTailOf(entry)]
      : [formatDayMonth(entry.date), 'avulsa', memberName];

  return parts.filter(Boolean).join(' · ');
}
