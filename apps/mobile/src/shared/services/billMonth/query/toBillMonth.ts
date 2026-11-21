import type { DocumentData } from '@react-native-firebase/firestore';

import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

/**
 * Converte o documento de `billMonths` (com o `id`) no mês que a tela lê. Chega com o `paidOn`, o dia em que o mês foi
 * pulado ou pago depois (hoje, enquanto o servidor ainda não carimbou o `createdAt`); o pulado, com `entryId` `null`;
 * a conta sem tag, com `tagId` `null`. Um `status` que o app não conhece chega como `null`, e quem lê o deixa de fora.
 */
export function toBillMonth(billMonth: DocumentData & { id: string }): IBillMonth | null {
  const { id, status, month, recurringBillId, entryId, name, tagId, createdBy } = billMonth;
  if (status !== 'paidLater' && status !== 'skipped') return null;

  const paidOn = toIsoDate(billMonth.createdAt?.toDate() ?? new Date());
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
