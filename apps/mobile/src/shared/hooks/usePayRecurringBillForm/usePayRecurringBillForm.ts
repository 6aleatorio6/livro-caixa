import { boolean, number, object } from 'yup';

import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import type { IPayRecurringBillFormContext } from '@/shared/types/form/PayRecurringBillFormContext';
import { isContributionRegistration } from '@/shared/utils/entry/isContributionRegistration';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { receiptSchema } from '@/shared/utils/form/receiptSchema';
import { formatCents } from '@/shared/utils/format/formatCents';

const payRecurringBillSchema = object({
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.')
    // O piso vale só para o pagamento: ligado o interruptor, ou abaixo de 30% do previsto, o registro é uma
    // contribuição, que num mês a pagar pode ter qualquer valor.
    .test('contributions-floor', '', function (value) {
      const { expectedCents = 0, contributedCents = 0 } =
        (this.options.context as IPayRecurringBillFormContext | undefined) ?? {};
      if (
        isContributionRegistration({ isPartial: this.parent.isPartial, amountCents: value }, expectedCents) ||
        value === null ||
        value >= contributedCents
      )
        return true;
      return this.createError({
        message: `O pagamento não fica abaixo das contribuições, de ${formatCents(contributedCents)}.`,
      });
    }),
  receipt: receiptSchema(),
  isPartial: boolean().defined(),
});

/**
 * O formulário do pagamento, no registro e na alteração. O valor começa no previsto (ou no pago, na alteração):
 * quem monta o formulário o passa nos valores iniciais. O contexto diz o previsto do mês, abaixo de 30% do qual o
 * registro é uma contribuição mesmo com o interruptor desligado, a soma das contribuições, abaixo da qual o pagamento
 * não fica, e, na alteração, se há comprovante salvo.
 */
export const usePayRecurringBillForm = createFormHook<IPayRecurringBillFormValues, IPayRecurringBillFormContext>(
  payRecurringBillSchema,
  { amountCents: null, receipt: null, isPartial: false },
);
