import { mixed, number, object, string } from 'yup';

import type { IOneOffBillFormValues } from '@/features/payments/types/OneOffBillFormValues';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';
import { createFormHook } from '@/shared/utils/form/createFormHook';

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
  receipt: mixed<IReceipt>()
    .nullable()
    .defined()
    .test('filled', 'Anexe o comprovante.', (value) => value !== null),
});

/** O formulário da conta avulsa. A data começa em hoje: quem monta o formulário a passa nos valores iniciais. */
export const useOneOffBillForm = createFormHook<IOneOffBillFormValues>(oneOffBillSchema, {
  name: '',
  amountCents: null,
  date: '',
  tagId: null,
  receipt: null,
});
