import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

/** O valor pago de uma conta: o do lançamento com dono, ou a soma das contribuições no pagamento sem dono. */
export function billAmountOf(entry: IBillEntry, entries: IEntry[]) {
  return entry.amountCents ?? sumCents(contributionsOf(entry.id, entries));
}
