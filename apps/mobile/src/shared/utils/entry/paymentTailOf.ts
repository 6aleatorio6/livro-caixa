import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { formatCents } from '@/shared/utils/format/formatCents';

/** A última parte do detalhe de um lançamento: no pagamento que saiu diferente do previsto, "previsto R$ X"; nos demais, nada. */
export function paymentTailOf(entry: IOwnedEntry) {
  if (entry.kind === 'recurringPayment' && entry.expectedAmountCents !== entry.amountCents) {
    return `previsto ${formatCents(entry.expectedAmountCents)}`;
  }

  return undefined;
}
