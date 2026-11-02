import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

/**
 * As contribuições já cobrem a conta, que não recebe outra: no lançamento com dono, alcançaram o valor pago; no
 * pagamento sem dono, o previsto do mês, e a conta está paga.
 */
export function isFullyContributed(bill: IBillEntry, entries: IEntry[]) {
  return (
    sumCents(contributionsOf(bill.id, entries)) >= (bill.paidBy === null ? bill.expectedAmountCents : bill.amountCents)
  );
}
