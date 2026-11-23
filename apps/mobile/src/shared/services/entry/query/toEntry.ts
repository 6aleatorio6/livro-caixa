import type { DocumentData } from '@react-native-firebase/firestore';

import type { IEntry } from '@/shared/types/entry/Entry';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

/**
 * Converte o documento de `entries` (com o `id`) no lançamento que a tela lê. O pagamento de conta recorrente e a
 * contribuição chegam com o `paidOn`, o dia em que foram registrados (hoje, enquanto o servidor ainda não carimbou o
 * `createdAt`) e o de uma conta atrasada, com o `billMonth`; o pagamento sem dono, com `paidBy`, `amountCents` e
 * `receiptFileId` `null`; a conta sem tag, com `tagId` `null`. Um `kind` que o app não conhece chega como `null`, e quem lê o deixa de fora.
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
  if (kind !== 'recurringPayment' && kind !== 'overduePayment') return null;

  const payment = {
    id,
    month,
    name,
    tagId: tagId ?? null,
    recurringBillId,
    dueDay,
    expectedAmountCents,
    date: null,
    paidOn,
  } as const;
  if (kind === 'overduePayment')
    return { ...payment, kind, billMonth: entry.billMonth, paidBy, amountCents, receiptFileId };
  return paidBy === undefined
    ? { ...payment, kind, paidBy: null, amountCents: null, receiptFileId: null }
    : { ...payment, kind, paidBy, amountCents, receiptFileId };
}
