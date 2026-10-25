import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

import { usePayRecurringBillForm } from '@/features/home/hooks/usePayRecurringBillForm/usePayRecurringBillForm';

export interface IPayRecurringBillFormProps {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês que a conta paga. */
  month: string;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** Recebe a entrada pronta; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IRecurringPaymentInput) => Promise<void>;
}

/** O pagamento de uma conta num mês: quem está sendo paga, o valor (do previsto, corrigível), o comprovante e o aviso. */
export function PayRecurringBillForm({ bill, month, tag, onSubmit }: IPayRecurringBillFormProps) {
  const { control, handleSubmit, formState } = usePayRecurringBillForm(undefined, {
    amountCents: bill.expectedAmountCents,
  });

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

      <MoneyFieldSmart
        control={control}
        name="amountCents"
        label="Valor pago"
        supportText="Veio do valor previsto. Corrija se pagou outro valor."
      />
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
