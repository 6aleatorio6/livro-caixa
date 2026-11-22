import type { DocumentData } from '@react-native-firebase/firestore';

import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

/**
 * Converte o documento de `overdueMonths` (com o `id`) no mês que a tela lê. Chega com o `paidOn`, o dia em que o mês foi
 * pulado ou pago depois (hoje, enquanto o servidor ainda não carimbou o `createdAt`); o pulado, com `entryId` `null`;
 * a conta sem tag, com `tagId` `null`. Um `status` que o app não conhece chega como `null`, e quem lê o deixa de fora.
 */
export function toOverdueMonth(overdueMonth: DocumentData & { id: string }): IOverdueMonth | null {
  const { id, status, month, recurringBillId, entryId, name, tagId, createdBy } = overdueMonth;
  if (status !== 'paidLater' && status !== 'skipped') return null;

  const paidOn = toIsoDate(overdueMonth.createdAt?.toDate() ?? new Date());
  return {
    id,
    status,
    month,
    recurringBillId,
    entryId: entryId ?? null,
    name,
    tagId: tagId ?? null,
    createdBy,
    paidOn,
  };
}
