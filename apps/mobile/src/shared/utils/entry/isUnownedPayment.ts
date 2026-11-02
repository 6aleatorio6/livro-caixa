import type { IEntry } from '@/shared/types/entry/Entry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';

/** O pagamento sem dono do mês com contribuições: tem o `kind` do pagamento, sem quem pagou. */
export function isUnownedPayment(entry: IEntry): entry is IUnownedPaymentEntry {
  return entry.kind === 'recurringPayment' && entry.paidBy === null;
}
