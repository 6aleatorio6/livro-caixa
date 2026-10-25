import type { IRecurringBillFormValues } from '@/features/recurringBills/types/RecurringBillFormValues';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';

/**
 * O contrário de `recurringBillInputOf`: o que o formulário guarda ao abrir uma conta para alterar. Com as
 * tags lidas (`tags`), uma `tagId` que não está nelas é de uma tag excluída e o formulário começa sem tag;
 * sem a leitura (`null`), a tag da conta fica como está.
 */
export function recurringBillFormValuesOf(bill: IRecurringBill, tags: ITag[] | null): IRecurringBillFormValues {
  const isTagKnown = tags === null || tags.some((tag) => tag.id === bill.tagId);

  return {
    name: bill.name,
    amountCents: bill.expectedAmountCents,
    dayOfMonth: String(bill.dayOfMonth),
    startsOn: bill.startsOn,
    tagId: isTagKnown ? bill.tagId : null,
  };
}
