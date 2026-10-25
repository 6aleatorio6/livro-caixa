import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { pluralize } from '@/shared/utils/format/pluralize';

/**
 * Os trechos do uso da tag que não são zero, recorrentes primeiro: ["2 contas recorrentes", "1 conta avulsa"].
 * `oneOffTagIds` traz o `tagId` de cada conta avulsa (repetido quando várias usam a mesma tag).
 */
export function tagUsageParts(bills: IRecurringBill[], oneOffTagIds: string[], tagId: string) {
  const recurring = bills.filter((bill) => bill.tagId === tagId).length;
  const oneOff = oneOffTagIds.filter((candidate) => candidate === tagId).length;

  return [
    ...(recurring > 0 ? [pluralize(recurring, 'conta recorrente', 'contas recorrentes')] : []),
    ...(oneOff > 0 ? [pluralize(oneOff, 'conta avulsa', 'contas avulsas')] : []),
  ];
}
