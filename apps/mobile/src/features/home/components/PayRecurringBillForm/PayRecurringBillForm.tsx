import { useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BillHeading } from '@/shared/components/BillHeading/BillHeading';
import { Button } from '@/shared/components/Button/Button';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { PartialPaymentSwitch } from '@/shared/components/PartialPaymentSwitch/PartialPaymentSwitch';
import { usePayRecurringBillForm } from '@/shared/hooks/usePayRecurringBillForm/usePayRecurringBillForm';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { isContributionRegistration } from '@/shared/utils/entry/isContributionRegistration';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IPayRecurringBillFormProps {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês que a conta paga. */
  month: string;
  /** O previsto do mês: o do pagamento sem dono, se o mês já tem contribuições, ou o da conta. */
  expectedCents: number;
  /** A soma das contribuições do mês, em centavos; sem contribuições, zero. */
  contributedCents: number;
  /** Quanto veio de contribuições e de quem ("R$ 500,00 de Bruno"); sem contribuições, nada. */
  contributionsSupport?: string;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** Os valores com que o formulário abre além do previsto: o comprovante compartilhado do Android, por exemplo. */
  initialValues?: Partial<Pick<IPayRecurringBillFormValues, 'receipt'>>;
  /**
   * Recebe a entrada pronta e se ela é uma contribuição (Paguei só uma parte); o formulário fica ocupado até a promessa
   * terminar.
   */
  onSubmit: (input: IRecurringPaymentInput, isContribution: boolean) => Promise<void>;
}

/**
 * O pagamento de uma conta num mês: quem está sendo paga, o valor (do previsto, corrigível), o interruptor Paguei só
 * uma parte, o comprovante e o aviso. Ligado o interruptor, o registro é uma contribuição. No mês com contribuições, o
 * valor começa na conta inteira, e o apoio diz com quanto quem paga fica.
 */
export function PayRecurringBillForm({
  bill,
  month,
  expectedCents,
  contributedCents,
  contributionsSupport,
  tag,
  initialValues,
  onSubmit,
}: IPayRecurringBillFormProps) {
  const form = usePayRecurringBillForm(
    { expectedCents, contributedCents },
    // Com as contribuições já no previsto ou acima dele, a conta inteira é a soma delas.
    { amountCents: Math.max(expectedCents, contributedCents), receipt: null, isPartial: false, ...initialValues },
  );
  const { control, handleSubmit, formState } = form;
  const [isPartial, amountCents] = useWatch({ control, name: ['isPartial', 'amountCents'] });
  // Ligado o interruptor, ou abaixo de 30% do previsto, o registro é uma contribuição.
  const isContribution = isContributionRegistration({ isPartial, amountCents }, expectedCents);
  const remainingCents = expectedCents - contributedCents;

  // O schema já recusou o valor e o comprovante vazios.
  const submit = handleSubmit((values) =>
    onSubmit(
      {
        bill,
        month,
        amountCents: values.amountCents as number,
        receipt: values.receipt as IRecurringPaymentInput['receipt'],
      },
      isContributionRegistration(values, expectedCents),
    ),
  );

  const paymentSupportText = contributionsSupport
    ? `A conta inteira, com os ${contributionsSupport}.${amountCents === null ? '' : ` Você fica com ${formatCents(amountCents - contributedCents)}.`}`
    : 'Veio do valor previsto. Corrija se pagou outro valor.';

  return (
    <View style={styles.form}>
      <BillHeading
        label={`Conta de ${monthName(month)}`}
        name={bill.name}
        tag={tag}
        details={
          contributedCents > 0
            ? `vence dia ${bill.dayOfMonth} · faltam ${formatCents(Math.max(remainingCents, 0))}`
            : `vence dia ${bill.dayOfMonth} · previsto ${formatCents(expectedCents)}`
        }
      />

      <AmountPaidFieldSmart
        form={form}
        label={isContribution ? 'Quanto você pagou' : 'Valor pago'}
        supportText={isContribution ? undefined : paymentSupportText}
        receiptNote={isContribution ? 'Veio do comprovante. Corrija se contribuiu com outro valor.' : undefined}
      />
      <PartialPaymentSwitch form={form} expectedCents={expectedCents} />
      <ReceiptFieldSmart control={control} name="receipt" />
      <OwnershipNotice
        subject="este pagamento"
        // O protótipo diz "O Aluguel": o artigo depende do nome da conta, que o app não sabe flexionar.
        consequence={isContribution ? 'A conta continua a pagar pelo que faltar.' : undefined}
      />

      <View style={styles.spacer} />
      <Button
        label={isContribution ? 'Registrar contribuição' : 'Registrar pagamento'}
        onPress={submit}
        isLoading={formState.isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.extraLarge },
  spacer: { height: theme.spacing.large },
}));
