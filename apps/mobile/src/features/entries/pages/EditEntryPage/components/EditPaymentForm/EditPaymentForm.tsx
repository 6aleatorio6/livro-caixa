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
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { monthName } from '@/shared/utils/date/monthName';
import { isContributionRegistration } from '@/shared/utils/entry/isContributionRegistration';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEditPaymentFormProps {
  entry: Extract<IOwnedEntry, { kind: 'recurringPayment' }>;
  /** A soma das contribuições que o pagamento recebeu, em centavos: o valor pago não fica abaixo dela. */
  contributedCents: number;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O comprovante já salvo: enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: IReceiptFile;
  /** Recebe o que o serviço de alterar pede; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IUpdateEntryInput) => Promise<void>;
  /** Recebe o pagamento que vira contribuição, com o interruptor Paguei só uma parte ligado. */
  onConvert: (input: IConvertEntryInput) => Promise<void>;
  /** A exclusão pelo botão do fim da tela deu certo. */
  onDeleted: () => void;
}

/**
 * A alteração do pagamento: a conta só para leitura, o valor pago e o comprovante, que são o que muda, o interruptor
 * Paguei só uma parte, que transforma o pagamento numa contribuição, e a exclusão. Com contribuições, o valor não fica
 * abaixo da soma delas, e o pagamento não é excluído.
 */
export function EditPaymentForm({
  entry,
  contributedCents,
  tag,
  currentReceipt,
  onSubmit,
  onConvert,
  onDeleted,
}: IEditPaymentFormProps) {
  const expectedCents = entry.expectedAmountCents;
  const form = usePayRecurringBillForm(
    { hasCurrentReceipt: Boolean(currentReceipt), expectedCents, contributedCents },
    { amountCents: entry.amountCents, isPartial: false },
  );
  const { control, handleSubmit, formState } = form;

  // O schema já recusou o valor vazio; sem arquivo novo, o comprovante fica o que está.
  const submit = handleSubmit(({ amountCents, receipt, isPartial }) =>
    isContributionRegistration({ isPartial, amountCents }, expectedCents)
      ? onConvert({ entry, amountCents: amountCents as number, receipt })
      : onSubmit({ entry, changes: { amountCents: amountCents as number }, receipt }),
  );

  return (
    <View style={styles.form}>
      <BillHeading
        label={`Pagamento de ${monthName(entry.month)}`}
        name={entry.name}
        tag={tag}
        details={`vence dia ${entry.dueDay} · previsto ${formatCents(expectedCents)}`}
      />

      <AmountPaidFieldSmart
        form={form}
        supportText={
          contributedCents > 0
            ? `Mínimo de ${formatCents(contributedCents)}, a soma das contribuições.`
            : 'Corrija se pagou outro valor.'
        }
      />
      <PartialPaymentSwitch
        form={form}
        expectedCents={expectedCents}
        supportText="Transforma este pagamento numa contribuição."
      />
      <ReceiptFieldSmart control={control} name="receipt" currentReceipt={currentReceipt} entryId={entry.id} />
      <Notice
        icon={UserRound}
        text={`Registrado por você em ${formatIsoDate(entry.paidOn)}. Só você pode alterar ou excluir.`}
      />

      <View style={styles.spacer} />
      <Button label="Salvar alterações" onPress={submit} isLoading={formState.isSubmitting} />
      <View style={styles.delete}>
        <DeleteEntryButton
          entry={entry}
          label="Excluir pagamento"
          disabledReason={contributedCents > 0 ? 'Com contribuições, o pagamento não pode ser excluído.' : undefined}
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
