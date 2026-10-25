import { mixed, number, object } from 'yup';

import type { IPayRecurringBillFormValues } from '@/features/home/types/PayRecurringBillFormValues';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { createFormHook } from '@/shared/utils/form/createFormHook';

const payRecurringBillSchema = object({
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.'),
  receipt: mixed<IReceipt>()
    .nullable()
    .defined()
    .test('filled', 'Anexe o comprovante.', (value) => value !== null),
});

/** O formulário do pagamento. O valor começa no previsto: quem monta o formulário o passa nos valores iniciais. */
export const usePayRecurringBillForm = createFormHook<IPayRecurringBillFormValues>(payRecurringBillSchema, {
  amountCents: null,
  receipt: null,
});
