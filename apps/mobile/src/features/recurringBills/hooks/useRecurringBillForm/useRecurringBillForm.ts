import { number, object, string } from 'yup';

import type { IRecurringBillFormValues } from '@/features/recurringBills/types/RecurringBillFormValues';
import { createFormHook } from '@/shared/utils/form/createFormHook';

const MIN_DAY = 1;
const MAX_DAY = 31;

/** Um dia inteiro de 1 a 31; o campo é texto, então "abc" e "1.5" chegam até aqui. */
function isDayOfMonth(value: string) {
  return /^\d{1,2}$/.test(value) && Number(value) >= MIN_DAY && Number(value) <= MAX_DAY;
}

const recurringBillSchema = object({
  name: string().trim().required().max(60),
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.'),
  dayOfMonth: string()
    .trim()
    .required()
    .test('day-of-month', 'Digite um dia de 1 a 31.', (value) => !value || isDayOfMonth(value)),
  startsOn: string().required(),
  tagId: string().nullable().defined(),
});

/** O formulário da conta recorrente, o mesmo ao cadastrar e ao alterar. */
export const useRecurringBillForm = createFormHook<IRecurringBillFormValues>(recurringBillSchema, {
  name: '',
  amountCents: null,
  dayOfMonth: '',
  startsOn: '',
  tagId: null,
});
