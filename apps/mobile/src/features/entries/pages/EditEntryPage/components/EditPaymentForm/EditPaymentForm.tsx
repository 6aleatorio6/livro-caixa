import { UserRound } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { Notice } from '@/shared/components/Notice/Notice';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import { usePayRecurringBillForm } from '@/shared/hooks/usePayRecurringBillForm/usePayRecurringBillForm';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEditPaymentFormProps {
  entry: Extract<IEntry, { kind: 'recurringPayment' }>;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O comprovante já salvo: enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: IReceiptFile;
  /** Recebe o que o serviço de alterar pede; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IUpdateEntryInput) => Promise<void>;
  /** A exclusão pelo botão do fim da tela deu certo. */
  onDeleted: () => void;
}

/** A alteração do pagamento: a conta só para leitura, o valor pago e o comprovante, que são o que muda, e a exclusão. */
export function EditPaymentForm({ entry, tag, currentReceipt, onSubmit, onDeleted }: IEditPaymentFormProps) {
  const { control, handleSubmit, formState } = usePayRecurringBillForm(
    { hasCurrentReceipt: Boolean(currentReceipt) },
    { amountCents: entry.amountCents },
  );

  // O schema já recusou o valor vazio; sem arquivo novo, o comprovante fica o que está.
  const submit = handleSubmit(({ amountCents, receipt }) =>
    onSubmit({ entry, changes: { amountCents: amountCents as number }, receipt }),
  );

  return (
    <View style={styles.form}>
      <View style={styles.bill}>
        <AppText variant="labelMedium" color="onSurfaceVariant">
          {`Pagamento de ${monthName(entry.month)}`}
        </AppText>
        <AppText variant="headlineSmallEmphasized">{entry.name}</AppText>
        <View style={styles.details}>
          {tag ? <TagChip name={tag.name} color={tag.color} /> : null}
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            {`vence dia ${entry.dueDay} · previsto ${formatCents(entry.expectedAmountCents)}`}
          </AppText>
        </View>
      </View>

      <MoneyFieldSmart
        control={control}
        name="amountCents"
        label="Valor pago"
        supportText="Corrija se pagou outro valor."
      />
      <ReceiptFieldSmart control={control} name="receipt" currentReceipt={currentReceipt} />
      <Notice
        icon={UserRound}
        text={`Registrado por você em ${formatIsoDate(entry.paidOn)}. Só você pode alterar ou excluir.`}
      />

      <View style={styles.spacer} />
      <Button label="Salvar alterações" onPress={submit} isLoading={formState.isSubmitting} />
      <View style={styles.delete}>
        <DeleteEntryButton entry={entry} label="Excluir pagamento" onDeleted={onDeleted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  bill: { gap: theme.spacing.small },
  details: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
  spacer: { height: theme.spacing.large },
  delete: { alignItems: 'center' },
}));
