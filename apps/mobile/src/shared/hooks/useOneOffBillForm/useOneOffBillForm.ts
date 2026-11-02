import { number, object, string } from 'yup';

import type { IOneOffBillFormValues } from '@/shared/types/entry/OneOffBillFormValues';
import type { IOneOffBillFormContext } from '@/shared/types/form/OneOffBillFormContext';
import { monthName } from '@/shared/utils/date/monthName';
import { monthOf } from '@/shared/utils/date/monthOf';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { receiptSchema } from '@/shared/utils/form/receiptSchema';
import { formatCents } from '@/shared/utils/format/formatCents';

const oneOffBillSchema = object({
  name: string().trim().required().max(60),
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.')
    // As contribuições somam no máximo o valor pago: quem registrou não o baixa para menos que elas.
    .test('contributions-floor', '', function (value) {
      const { contributedCents = 0 } = (this.options.context as IOneOffBillFormContext | undefined) ?? {};
      if (value === null || value >= contributedCents) return true;
      return this.createError({
        message: `O valor não fica abaixo das contribuições, de ${formatCents(contributedCents)}.`,
      });
    }),
  // O calendário já para em hoje, mas o valor também chega por outros caminhos.
  date: string()
    .required()
    .test('notAfterToday', 'A data não pode passar de hoje.', (value) => value <= toIsoDate(new Date()))
    // A contribuição guarda o mês da conta e não muda junto: com contribuições, a data fica no mesmo mês.
    .test('lockedMonth', '', function (value) {
      const { lockedMonth = null } = (this.options.context as IOneOffBillFormContext | undefined) ?? {};
      if (lockedMonth === null || monthOf(value) === lockedMonth) return true;
      return this.createError({ message: `Com contribuições, a data fica em ${monthName(lockedMonth)}.` });
    }),
  tagId: string().nullable().defined(),
  receipt: receiptSchema(),
});

/**
 * O formulário da conta avulsa, no registro e na alteração. A data começa em hoje: quem monta o formulário a passa
 * nos valores iniciais, que na alteração são os da conta. Na alteração, o contexto diz se há comprovante salvo e, com
 * contribuições, a soma delas e o mês de que a data não sai.
 */
export const useOneOffBillForm = createFormHook<IOneOffBillFormValues, IOneOffBillFormContext>(oneOffBillSchema, {
  name: '',
  amountCents: null,
  date: '',
  tagId: null,
  receipt: null,
});
