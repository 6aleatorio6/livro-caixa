import { number, object, string } from 'yup';

import type { IOneOffBillFormValues } from '@/shared/types/entry/OneOffBillFormValues';
import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { receiptSchema } from '@/shared/utils/form/receiptSchema';

const oneOffBillSchema = object({
  name: string().trim().required().max(60),
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.'),
  // O calendário já para em hoje, mas o valor também chega por outros caminhos.
  date: string()
    .required()
    .test('notAfterToday', 'A data não pode passar de hoje.', (value) => value <= toIsoDate(new Date())),
  tagId: string().nullable().defined(),
  receipt: receiptSchema(),
});

/**
 * O formulário da conta avulsa, no registro e na alteração. A data começa em hoje: quem monta o formulário a passa
 * nos valores iniciais, que na alteração são os da conta. Na alteração, o contexto diz se há comprovante salvo.
 */
export const useOneOffBillForm = createFormHook<IOneOffBillFormValues, IReceiptFormContext>(oneOffBillSchema, {
  name: '',
  amountCents: null,
  date: '',
  tagId: null,
  receipt: null,
});
