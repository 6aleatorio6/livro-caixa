import { UserRound } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { useContributionForm } from '@/features/entries/hooks/useContributionForm/useContributionForm';
import { BillHeading } from '@/shared/components/BillHeading/BillHeading';
import { Button } from '@/shared/components/Button/Button';
import { AmountPaidFieldSmart } from '@/shared/components/inputs/AmountPaidFieldSmart/AmountPaidFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { Notice } from '@/shared/components/Notice/Notice';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEditContributionFormProps {
  entry: IContributionEntry;
  /** O lançamento registrado que recebe a contribuição: o pagamento com dono ou a conta avulsa. */
  target: IOwnedEntry;
  /** A soma das outras contribuições que ele recebeu, em centavos. */
  otherContributedCents: number;
  /** Os lançamentos do mês, para a exclusão. */
  monthEntries: IEntry[];
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O comprovante já salvo: enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: IReceiptFile;
  onSubmit: (input: IUpdateEntryInput) => Promise<void>;
  onDeleted: () => void;
}

/**
 * A alteração da contribuição num lançamento já registrado: o valor, que não passa do que falta com as outras
 * contribuições, o comprovante e a exclusão. Não tem o interruptor: o mês já tem quem pagou, e a contribuição não
 * teria em que pagamento se transformar.
 */
export function EditContributionForm({
  entry,
  target,
  otherContributedCents,
  monthEntries,
  tag,
  currentReceipt,
  onSubmit,
  onDeleted,
}: IEditContributionFormProps) {
  const form = useContributionForm(
    { hasCurrentReceipt: Boolean(currentReceipt), remainingCents: target.amountCents - otherContributedCents },
    { amountCents: entry.amountCents, receipt: null },
  );
  const { control, handleSubmit, formState } = form;

  const submit = handleSubmit(({ amountCents, receipt }) =>
    onSubmit({ entry, changes: { amountCents: amountCents as number }, receipt }),
  );

  return (
    <View style={styles.form}>
      <BillHeading
        label={`Contribuição de ${monthName(entry.month)}`}
        name={target.name}
        tag={tag}
        details={`${formatCents(target.amountCents)} pagos`}
      />

      <AmountPaidFieldSmart
        form={form}
        label="Quanto você contribuiu"
        supportText="Corrija se contribuiu com outro valor."
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
