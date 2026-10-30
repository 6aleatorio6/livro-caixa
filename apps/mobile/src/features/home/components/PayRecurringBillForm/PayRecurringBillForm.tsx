import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import { usePayRecurringBillForm } from '@/shared/hooks/usePayRecurringBillForm/usePayRecurringBillForm';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IPayRecurringBillFormValues } from '@/shared/types/entry/PayRecurringBillFormValues';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IPayRecurringBillFormProps {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês que a conta paga. */
  month: string;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** Os valores com que o formulário abre além do previsto: o comprovante compartilhado do Android, por exemplo. */
  initialValues?: Partial<Pick<IPayRecurringBillFormValues, 'receipt'>>;
  /** Recebe a entrada pronta; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IRecurringPaymentInput) => Promise<void>;
}

/** O pagamento de uma conta num mês: quem está sendo paga, o valor (do previsto, corrigível), o comprovante e o aviso. */
export function PayRecurringBillForm({ bill, month, tag, initialValues, onSubmit }: IPayRecurringBillFormProps) {
  const form = usePayRecurringBillForm(undefined, {
    amountCents: bill.expectedAmountCents,
    receipt: null,
    ...initialValues,
  });
  const { control, handleSubmit, formState } = form;

  // O schema já recusou o valor e o comprovante vazios.
  const submit = handleSubmit(({ amountCents, receipt }) =>
    onSubmit({
      bill,
      month,
      amountCents: amountCents as number,
      receipt: receipt as IRecurringPaymentInput['receipt'],
    }),
  );

  return (
    <View style={styles.form}>
      <View style={styles.bill}>
        <AppText variant="labelMedium" color="onSurfaceVariant">
          {`Conta de ${monthName(month)}`}
        </AppText>
        <AppText variant="headlineSmallEmphasized">{bill.name}</AppText>
        <View style={styles.details}>
          {tag ? <TagChip name={tag.name} color={tag.color} /> : null}
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            {`vence dia ${bill.dayOfMonth} · previsto ${formatCents(bill.expectedAmountCents)}`}
          </AppText>
        </View>
      </View>

      <AmountPaidFieldSmart form={form} supportText="Veio do valor previsto. Corrija se pagou outro valor." />
      <ReceiptFieldSmart control={control} name="receipt" />
      <OwnershipNotice subject="este pagamento" />

      <View style={styles.spacer} />
      <Button label="Registrar pagamento" onPress={submit} isLoading={formState.isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.extraLarge },
  bill: { gap: theme.spacing.small },
  details: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
  spacer: { height: theme.spacing.large },
}));
