import type { IEntry } from '@/shared/types/entry/Entry';
import { formatCents } from '@/shared/utils/format/formatCents';

/**
 * A última parte do detalhe de um lançamento: no pagamento que saiu diferente do previsto, "previsto R$ X"
 * no lugar da tag; nos demais casos, o nome da tag (ou nada, sem ela).
 */
export function paymentTailOf(entry: IEntry, tagName?: string) {
  if (entry.kind === 'recurringPayment' && entry.expectedAmountCents !== entry.amountCents) {
    return `previsto ${formatCents(entry.expectedAmountCents)}`;
  }

  return tagName;
}
