import type { IEntry } from '@/shared/types/entry/Entry';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';

/**
 * O detalhe da linha de um lançamento no Início: o pagamento, "dia 5 · Ana · Casa" (o vencimento, quem pagou,
 * e o previsto no lugar da tag se o pago foi outro valor); a conta avulsa, "12/10 · avulsa · Bruno · Casa".
 */
export function homeEntrySupportOf(entry: IEntry, { memberName, tagName }: { memberName: string; tagName?: string }) {
  const parts =
    entry.kind === 'recurringPayment'
      ? [`dia ${entry.dueDay}`, memberName, paymentTailOf(entry, tagName)]
      : [formatDayMonth(entry.date), 'avulsa', memberName, tagName];

  return parts.filter(Boolean).join(' · ');
}
