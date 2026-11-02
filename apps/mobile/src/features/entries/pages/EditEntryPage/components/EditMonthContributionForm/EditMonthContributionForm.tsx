import { UserRound } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { BillHeading } from '@/shared/components/BillHeading/BillHeading';
import { Button } from '@/shared/components/Button/Button';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { Notice } from '@/shared/components/Notice/Notice';
import { PartialPaymentSwitch } from '@/shared/components/PartialPaymentSwitch/PartialPaymentSwitch';
import { usePayRecurringBillForm } from '@/shared/hooks/usePayRecurringBillForm/usePayRecurringBillForm';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { monthName } from '@/shared/utils/date/monthName';
import { isContributionRegistration } from '@/shared/utils/entry/isContributionRegistration';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEditMonthContributionFormProps {
  entry: IContributionEntry;
  /** O pagamento sem dono do mês, que recebe a contribuição. */
  target: IUnownedPaymentEntry;
  /** A soma das outras contribuições do mês, em centavos: o pagamento não fica abaixo dela. */
  otherContributedCents: number;
  /** Os lançamentos do mês, para a exclusão. */
  monthEntries: IEntry[];
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O comprovante já salvo: enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: IReceiptFile;
  onSubmit: (input: IUpdateEntryInput) => Promise<void>;
  /** Recebe a contribuição que vira o pagamento do mês, com o interruptor desligado. */
  onConvert: (input: IConvertEntryInput) => Promise<void>;
  onDeleted: () => void;
}

/**
 * A alteração da contribuição num mês ainda sem quem pagou: o valor, o comprovante e o interruptor Paguei só uma parte,
 * ligado. Desligado, a contribuição vira o pagamento do mês, se o valor alcança 30% do previsto (abaixo disso o
 * interruptor trava ligado) e a soma das outras contribuições.
 */
export function EditMonthContributionForm({
  entry,
  target,
  otherContributedCents,
  monthEntries,
  tag,
  currentReceipt,
  onSubmit,
  onConvert,
  onDeleted,
}: IEditMonthContributionFormProps) {
  const expectedCents = target.expectedAmountCents;
  const form = usePayRecurringBillForm(
    { hasCurrentReceipt: Boolean(currentReceipt), expectedCents, contributedCents: otherContributedCents },
    { amountCents: entry.amountCents, isPartial: true },
  );
  const { control, handleSubmit, formState } = form;

  const submit = handleSubmit(({ amountCents, receipt, isPartial }) =>
    isContributionRegistration({ isPartial, amountCents }, expectedCents)
      ? onSubmit({ entry, changes: { amountCents: amountCents as number }, receipt })
      : onConvert({ entry, amountCents: amountCents as number, receipt }),
  );

  return (
    <View style={styles.form}>
      <BillHeading
        label={`Contribuição de ${monthName(entry.month)}`}
        name={target.name}
        tag={tag}
        details={`vence dia ${target.dueDay} · previsto ${formatCents(expectedCents)}`}
      />

      <AmountPaidFieldSmart form={form} label="Quanto você pagou" supportText="Corrija se pagou outro valor." />
      <PartialPaymentSwitch
        form={form}
        expectedCents={expectedCents}
        supportText={`Desligado, vira o pagamento de ${monthName(entry.month)} da conta.`}
      />
      <ReceiptFieldSmart control={control} name="receipt" currentReceipt={currentReceipt} entryId={entry.id} />
      <Notice
        icon={UserRound}
        text={`Registrada por você em ${formatIsoDate(entry.paidOn)}. Só você pode alterar ou excluir.`}
      />

      <View style={styles.spacer} />
      <Button label="Salvar alterações" onPress={submit} isLoading={formState.isSubmitting} />
      <View style={styles.delete}>
        <DeleteEntryButton
          entry={entry}
          label="Excluir contribuição"
          monthEntries={monthEntries}
          onDeleted={onDeleted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  spacer: { height: theme.spacing.large },
  delete: { alignItems: 'center' },
}));
