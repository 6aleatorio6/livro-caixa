import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BillHeading } from '@/shared/components/BillHeading/BillHeading';
import { Button } from '@/shared/components/Button/Button';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IContributionInput } from '@/shared/types/entry/ContributionInput';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

import { useContributionForm } from '@/features/entries/hooks/useContributionForm/useContributionForm';

export interface IContributionFormProps {
  /** O lançamento que recebe a contribuição. */
  target: IBillEntry;
  /** O valor pago do lançamento: o dele, ou a soma das contribuições no pagamento sem dono. */
  targetAmountCents: number;
  /** A soma das contribuições que ele já recebeu, em centavos. */
  contributedCents: number;
  /** O primeiro nome de quem pagou; `null` no pagamento sem dono. */
  payerName: string | null;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O comprovante com que o formulário abre: o compartilhado do Android, por exemplo. */
  initialReceipt: IReceipt | null;
  /** Recebe a entrada pronta; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IContributionInput) => Promise<void>;
}

/**
 * A contribuição num lançamento já registrado, com ele no topo: de quem é e o valor pago. Embaixo, quanto a pessoa
 * contribuiu (sem passar do que falta), o comprovante e o aviso. O pagamento sem dono não tem o limite: as
 * contribuições podem passar do previsto.
 */
export function ContributionForm({
  target,
  targetAmountCents,
  contributedCents,
  payerName,
  tag,
  initialReceipt,
  onSubmit,
}: IContributionFormProps) {
  const payerPartCents = targetAmountCents - contributedCents;
  const form = useContributionForm(
    { remainingCents: payerName === null ? null : payerPartCents },
    { amountCents: null, receipt: initialReceipt },
  );
  const { control, handleSubmit, formState } = form;

  // O schema já recusou o valor e o comprovante vazios.
  const submit = handleSubmit((values) =>
    onSubmit({
      target: { entry: target },
      amountCents: values.amountCents as number,
      receipt: values.receipt as IReceipt,
    }),
  );

  const kindLabel = target.kind === 'oneOffBill' ? 'Conta avulsa' : 'Pagamento';
  const heading =
    payerName === null
      ? `Conta de ${monthName(target.month)}`
      : `${kindLabel} de ${payerName} · ${monthName(target.month)}`;
  const amountLine =
    payerName === null
      ? `previsto ${formatCents(target.kind === 'recurringPayment' ? target.expectedAmountCents : targetAmountCents)}`
      : formatCents(targetAmountCents);
  const consequence = payerName === null ? 'A conta continua a pagar pelo que faltar.' : undefined;

  return (
    <View style={styles.form}>
      <BillHeading label={heading} name={target.name} tag={tag} details={amountLine} />

      <AmountPaidFieldSmart
        form={form}
        label="Quanto você contribuiu"
        receiptNote="Veio do comprovante. Corrija se contribuiu com outro valor."
      />
      <ReceiptFieldSmart control={control} name="receipt" />
      <OwnershipNotice subject="esta contribuição" consequence={consequence} />

      <View style={styles.spacer} />
      <Button label="Registrar contribuição" onPress={submit} isLoading={formState.isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.extraLarge },
  spacer: { height: theme.spacing.large },
}));
