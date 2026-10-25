import { number, object } from 'yup';

import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { receiptSchema } from '@/shared/utils/form/receiptSchema';

const payRecurringBillSchema = object({
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.'),
  receipt: receiptSchema(),
});

/**
 * O formulário do pagamento, no registro e na alteração. O valor começa no previsto (ou no pago, na alteração):
 * quem monta o formulário o passa nos valores iniciais. Na alteração, o contexto diz se há comprovante salvo.
 */
export const usePayRecurringBillForm = createFormHook<IPayRecurringBillFormValues, IReceiptFormContext>(
  payRecurringBillSchema,
  { amountCents: null, receipt: null },
);
