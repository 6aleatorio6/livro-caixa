import type { DocumentData } from '@react-native-firebase/firestore';

import type { IEntry } from '@/shared/types/entry/Entry';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

/**
 * Converte o documento de `entries` (com o `id`) no lançamento que a tela lê: o pagamento de conta
 * recorrente chega sem data e com o `paidOn`, o dia em que foi registrado (hoje, enquanto o servidor
 * ainda não carimbou o `createdAt`), e a conta sem tag, com `tagId` `null`.
 */
export function toEntry(entry: DocumentData & { id: string }): IEntry {
  const { id, kind, month, name, amountCents, date, recurringBillId, dueDay, expectedAmountCents, tagId, paidBy, receiptFileId } = entry;
  const common = { id, month, name, amountCents, tagId: tagId ?? null, paidBy, receiptFileId };
  return kind === 'recurringPayment'
    ? {
        ...common,
        kind,
        recurringBillId,
        dueDay,
        expectedAmountCents,
        date: null,
        paidOn: toIsoDate(entry.createdAt?.toDate() ?? new Date()),
      }
    : { ...common, kind: 'oneOffBill', date };
}
