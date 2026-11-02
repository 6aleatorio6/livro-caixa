import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';

/**
 * O detalhe da linha de um lançamento no Início, sem a tag (a linha a mostra como bolinha): o pagamento,
 * "dia 5 · Ana" (o vencimento, quem pagou e o previsto, se o pago foi outro valor); a conta avulsa,
 * "12/10 · avulsa · Bruno".
 */
export function homeEntrySupportOf(entry: IOwnedEntry, memberName: string) {
  const parts =
    entry.kind === 'recurringPayment'
      ? [`dia ${entry.dueDay}`, memberName, paymentTailOf(entry)]
      : [formatDayMonth(entry.date), 'avulsa', memberName];

  return parts.filter(Boolean).join(' · ');
}
