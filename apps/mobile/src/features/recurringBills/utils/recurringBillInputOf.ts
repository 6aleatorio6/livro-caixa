import type { IRecurringBillFormValues } from '@/features/recurringBills/types/RecurringBillFormValues';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';

/** O que o formulário validado entrega ao serviço: o dia vira inteiro e o valor, o previsto. */
export function recurringBillInputOf({ name, amountCents, dayOfMonth, startsOn, tagId }: IRecurringBillFormValues): IRecurringBillInput {
  return {
    name,
    // O schema já recusou o valor vazio.
    expectedAmountCents: amountCents as number,
    dayOfMonth: Number(dayOfMonth),
    startsOn,
    tagId,
  };
}
