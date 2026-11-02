import { number, object } from 'yup';

import type { IContributionFormValues } from '@/features/entries/types/ContributionFormValues';
import type { IContributionFormContext } from '@/features/entries/types/ContributionFormContext';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { receiptSchema } from '@/shared/utils/form/receiptSchema';
import { formatCents } from '@/shared/utils/format/formatCents';

const contributionSchema = object({
  // O campo vazio é `null`: o `.required()` do Yup recusaria o tipo, não o vazio.
  amountCents: number()
    .nullable()
    .defined()
    .test('filled', 'Preencha este campo.', (value) => value !== null)
    .min(1, 'Digite um valor maior que zero.')
    .test('remaining', '', function (value) {
      const { remainingCents = null } = (this.options.context as IContributionFormContext | undefined) ?? {};
      if (value === null || remainingCents === null || value <= remainingCents) return true;
      return this.createError({ message: `A contribuição passa do que falta, ${formatCents(remainingCents)}.` });
    }),
  receipt: receiptSchema(),
});

/**
 * O formulário da contribuição num lançamento registrado: o valor, que não passa do que falta (as contribuições somam
 * no máximo o valor pago), e o comprovante.
 */
export const useContributionForm = createFormHook<IContributionFormValues, IContributionFormContext>(contributionSchema, {
  amountCents: null,
  receipt: null,
});
