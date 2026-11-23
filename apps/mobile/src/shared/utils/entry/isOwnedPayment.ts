import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedPaymentEntry } from '@/shared/types/entry/OwnedPaymentEntry';

/** O pagamento de uma conta recorrente com dono, do mês dela ou atrasado: nem a avulsa, nem a contribuição, nem o pagamento sem dono. */
export function isOwnedPayment(entry: IEntry): entry is IOwnedPaymentEntry {
  return entry.kind === 'overduePayment' || (entry.kind === 'recurringPayment' && entry.paidBy !== null);
}
