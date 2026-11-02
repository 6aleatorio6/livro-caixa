import type { DocumentData } from '@react-native-firebase/firestore';

import type { IEntry } from '@/shared/types/entry/Entry';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

/**
 * Converte o documento de `entries` (com o `id`) no lançamento que a tela lê. O pagamento de conta recorrente e a
 * contribuição chegam com o `paidOn`, o dia em que foram registrados (hoje, enquanto o servidor ainda não carimbou o
 * `createdAt`); o pagamento sem dono, com `paidBy`, `amountCents` e `receiptFileId` `null`; a conta sem tag, com
 * `tagId` `null`. Um `kind` que o app não conhece chega como `null`, e quem lê o deixa de fora.
 */
export function toEntry(entry: DocumentData & { id: string }): IEntry | null {
  const {
    id,
    kind,
    month,
    name,
    amountCents,
    date,
    recurringBillId,
    dueDay,
    expectedAmountCents,
    tagId,
    paidBy,
    receiptFileId,
  } = entry;
  const paidOn = toIsoDate(entry.createdAt?.toDate() ?? new Date());
  if (kind === 'contribution')
    return { id, kind, month, entryId: entry.entryId, amountCents, paidBy, receiptFileId, paidOn };
  if (kind === 'oneOffBill')
    return { id, kind, month, name, amountCents, date, tagId: tagId ?? null, paidBy, receiptFileId };
  if (kind !== 'recurringPayment') return null;

  const payment = {
    id,
    kind,
    month,
    name,
    tagId: tagId ?? null,
    recurringBillId,
    dueDay,
    expectedAmountCents,
    date: null,
    paidOn,
  } as const;
  return paidBy === undefined
    ? { ...payment, paidBy: null, amountCents: null, receiptFileId: null }
    : { ...payment, paidBy, amountCents, receiptFileId };
}
