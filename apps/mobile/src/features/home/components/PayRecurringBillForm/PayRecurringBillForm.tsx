import { useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { OVERDUE_LOOK } from '@/features/home/constants/overdueLook';
import { BillHeading } from '@/shared/components/BillHeading/BillHeading';
import { Button } from '@/shared/components/Button/Button';
import { ConfirmButton } from '@/shared/components/ConfirmButton/ConfirmButton';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { Notice } from '@/shared/components/Notice/Notice';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { PartialPaymentSwitch } from '@/shared/components/PartialPaymentSwitch/PartialPaymentSwitch';
import { usePayRecurringBillForm } from '@/shared/hooks/usePayRecurringBillForm/usePayRecurringBillForm';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { dayOf } from '@/shared/utils/date/dayOf';
import { monthName } from '@/shared/utils/date/monthName';
import { isContributionRegistration } from '@/shared/utils/entry/isContributionRegistration';
import { formatCents } from '@/shared/utils/format/formatCents';
import { dueDateInMonth } from '@/shared/utils/recurringBill/dueDateInMonth';

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
  /**
   * A conta de um mês anterior ao atual, que o pagamento paga no mês de hoje: ganha o selo "Atrasada" e o aviso do
   * atraso, e perde o interruptor Paguei só uma parte, porque o pagamento atrasado não tem contribuição.
   */
  isOverdue?: boolean;
  /** O "Pular" da atrasada, chamado depois da confirmação; sem ele (o mês já pulado, ou a conta em dia), o botão some. */
  onSkip?: () => void;
  /** O pedido do pulo está em andamento: o "Pular" fica ocupado e não aceita outro toque. */
  isSkipping?: boolean;
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
 * valor começa na conta inteira, e o apoio diz que ela inclui as contribuições. A atrasada leva o selo e o aviso do
 * atraso, não tem o interruptor e pode ser pulada.
 */
export function PayRecurringBillForm({
  bill,
  month,
  expectedCents,
  contributedCents,
  contributionsSupport,
  tag,
  isOverdue = false,
  onSkip,
  isSkipping = false,
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
  // Ligado o interruptor, ou abaixo de 30% do previsto, o registro é uma contribuição; a atrasada paga a conta inteira.
  const isContribution = !isOverdue && isContributionRegistration({ isPartial, amountCents }, expectedCents);
  const dueText = `${isOverdue ? 'venceu' : 'vence'} dia ${bill.dayOfMonth}`;
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
      isContribution,
    ),
  );

  const paymentSupportText = contributionsSupport
    ? `A conta inteira, com os ${contributionsSupport}.`
    : 'Veio do valor previsto. Corrija se pagou outro valor.';

  return (
    <View style={styles.form}>
      <BillHeading
        label={`Conta de ${monthName(month)}`}
        name={bill.name}
        badge={isOverdue ? OVERDUE_LOOK.badge : undefined}
        tag={tag}
        details={
          contributedCents > 0
            ? `${dueText} · faltam ${formatCents(Math.max(remainingCents, 0))}`
            : `${dueText} · previsto ${formatCents(expectedCents)}`
        }
      />

      {isOverdue ? (
        <Notice
          tone="error"
          icon={OVERDUE_LOOK.icon}
          text={`Atrasada desde ${dayOf(dueDateInMonth(bill.dayOfMonth, month))} de ${monthName(month)}. O pagamento conta em ${monthName(currentMonth())}, o mês em que você paga.`}
        />
      ) : null}

      <AmountPaidFieldSmart
        form={form}
        label={isContribution ? 'Quanto você pagou' : 'Valor pago'}
        supportText={isContribution ? undefined : paymentSupportText}
        receiptNote={isContribution ? 'Veio do comprovante. Corrija se contribuiu com outro valor.' : undefined}
      />
      {isOverdue ? null : <PartialPaymentSwitch form={form} expectedCents={expectedCents} />}
      <ReceiptFieldSmart control={control} name="receipt" />
      <OwnershipNotice
        subject="este pagamento"
        // O protótipo diz "O Aluguel": o artigo depende do nome da conta, que o app não sabe flexionar.
        consequence={isContribution ? 'A conta continua a pagar pelo que faltar.' : undefined}
      />

      <View style={styles.spacer} />
      <View style={styles.actions}>
        <Button
          label={isContribution ? 'Registrar contribuição' : 'Registrar pagamento'}
          onPress={submit}
          isLoading={formState.isSubmitting}
        />
        {onSkip ? (
          <ConfirmButton
            label={`Pular ${monthName(month)}`}
            variant="text"
            title={`Pular a ${bill.name} de ${monthName(month)}?`}
            message={`Ela sai das contas a pagar e não conta em nenhum mês. Fica nas Puladas de ${monthName(month)}, de onde dá para pagá-la depois.`}
            confirmLabel="Pular"
            confirmVariant="text"
            isLoading={isSkipping}
            onConfirm={onSkip}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.extraLarge },
  spacer: { height: theme.spacing.large },
  actions: { gap: theme.spacing.small },
}));
