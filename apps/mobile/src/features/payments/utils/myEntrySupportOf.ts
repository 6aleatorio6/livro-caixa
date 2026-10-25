import type { IEntry } from '@/shared/types/entry/Entry';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';

/**
 * O detalhe da linha de um lançamento em Meus pagamentos, sem o nome de quem pagou (é sempre a pessoa
 * logada): o pagamento, "pago em 05/10 · Casa" (ou o previsto no lugar da tag); a conta avulsa, "12/10 · avulsa · Casa".
 */
export function myEntrySupportOf(entry: IEntry, tagName?: string) {
  const parts =
    entry.kind === 'recurringPayment'
      ? [`pago em ${formatDayMonth(entry.paidOn)}`, paymentTailOf(entry, tagName)]
      : [formatDayMonth(entry.date), 'avulsa', tagName];

  return parts.filter(Boolean).join(' · ');
}
