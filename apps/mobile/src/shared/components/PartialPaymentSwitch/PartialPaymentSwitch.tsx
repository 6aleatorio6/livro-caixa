import { type UseFormReturn, useWatch } from 'react-hook-form';

import { SwitchFieldSmart } from '@/shared/components/inputs/SwitchFieldSmart/SwitchFieldSmart';
import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import { isContributionOnly } from '@/shared/utils/entry/isContributionOnly';
import { paymentMinimumCents } from '@/shared/utils/entry/paymentMinimumCents';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IPartialPaymentSwitchProps<TContext> {
  form: UseFormReturn<IPayRecurringBillFormValues, TContext>;
  /** O previsto do mês, em centavos. */
  expectedCents: number;
  /** O apoio com o interruptor livre: o que acontece ao mudá-lo. Sem ele, o do registro. */
  supportText?: string;
}

/**
 * O interruptor Paguei só uma parte. Abaixo de 30% do previsto, ele aparece ligado e travado, porque o registro só
 * pode ser uma contribuição; acima disso, volta à escolha da pessoa. O valor do formulário guarda só essa escolha: o
 * valor digitado passa por baixo de 30% a cada dígito, e o interruptor não pode ficar ligado por isso.
 */
export function PartialPaymentSwitch<TContext>({
  form,
  expectedCents,
  supportText = 'Vira uma contribuição, e a conta continua a pagar pelo que faltar.',
}: IPartialPaymentSwitchProps<TContext>) {
  const amountCents = useWatch({ control: form.control, name: 'amountCents' });
  const isLocked = isContributionOnly(amountCents, expectedCents);

  return (
    <SwitchFieldSmart
      control={form.control}
      name="isPartial"
      label="Paguei só uma parte"
      isLockedOn={isLocked}
      supportText={
        isLocked
          ? `Abaixo de 30% do previsto (${formatCents(paymentMinimumCents(expectedCents))}), só pode ser uma contribuição.`
          : supportText
      }
    />
  );
}
