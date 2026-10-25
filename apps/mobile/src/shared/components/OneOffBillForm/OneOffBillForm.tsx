import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { DateFieldSmart } from '@/shared/components/inputs/DateFieldSmart/DateFieldSmart';
import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { TagChoiceSmart } from '@/shared/components/inputs/TagChoiceSmart/TagChoiceSmart';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import { useOneOffBillForm } from '@/shared/hooks/useOneOffBillForm/useOneOffBillForm';
import type { IOneOffBillFormValues } from '@/shared/types/entry/OneOffBillFormValues';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';
import { oneOffBillInputOf } from '@/shared/utils/entry/oneOffBillInputOf';

/** O que o formulário entrega: com um comprovante já salvo, o comprovante pode vir `null` (fica o que está). */
type IOneOffBillSubmission<TCurrentReceipt> = Omit<IOneOffBillInput, 'receipt'> & {
  receipt: TCurrentReceipt extends undefined ? IReceipt : IReceipt | null;
};

export interface IOneOffBillFormProps<TCurrentReceipt extends IReceiptFile | undefined = undefined> {
  /** As tags para escolher. */
  tags: ITag[];
  /** A leitura das tags falhou: `tags` está vazia por isso. */
  hasTagsError: boolean;
  /** Os valores com que o formulário abre; sem eles, a data é hoje e o resto fica vazio (o registro). */
  initialValues?: Partial<Pick<IOneOffBillFormValues, 'name' | 'amountCents' | 'date' | 'tagId' | 'receipt'>>;
  /** O comprovante já salvo (a alteração): enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: TCurrentReceipt;
  /** O rótulo do botão; o padrão é o do registro. */
  submitLabel?: string;
  /** O apoio da data; o padrão é o do registro, que diz "Hoje, por padrão". */
  dateSupportText?: string;
  /** O aviso depois do comprovante (o "Fica no seu nome" do registro). */
  notice?: ReactNode;
  /** O que vem depois do botão (o "Excluir" da alteração), centralizado. */
  footer?: ReactNode;
  /** Recebe a entrada já convertida; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IOneOffBillSubmission<TCurrentReceipt>) => Promise<void>;
}

/** O formulário da conta avulsa, no registro (já paga, em nome de quem registra, com o comprovante) e na alteração. */
export function OneOffBillForm<TCurrentReceipt extends IReceiptFile | undefined = undefined>({
  tags,
  hasTagsError,
  initialValues,
  currentReceipt,
  submitLabel = 'Registrar conta avulsa',
  dateSupportText = 'Hoje, por padrão. A data define o mês em que a conta entra.',
  notice,
  footer,
  onSubmit,
}: IOneOffBillFormProps<TCurrentReceipt>) {
  const { control, handleSubmit, formState } = useOneOffBillForm(
    { hasCurrentReceipt: Boolean(currentReceipt) },
    { date: toIsoDate(new Date()), ...initialValues },
  );
  // O schema já recusou o valor vazio, e o comprovante vazio quando não há um salvo.
  const submit = handleSubmit((values) =>
    onSubmit({ ...oneOffBillInputOf(values), receipt: values.receipt } as IOneOffBillSubmission<TCurrentReceipt>),
  );

  return (
    <View style={styles.form}>
      <TextFieldSmart control={control} name="name" label="Nome da conta" autoCapitalize="sentences" />
      <MoneyFieldSmart control={control} name="amountCents" label="Valor pago" />
      <DateFieldSmart
        control={control}
        name="date"
        label="Data"
        supportText={dateSupportText}
        maximumDate={new Date()}
      />

      <View style={styles.tagGroup}>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          Tag (opcional)
        </AppText>
        {hasTagsError ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar as tags.
          </AppText>
        ) : (
          <TagChoiceSmart control={control} name="tagId" tags={tags} />
        )}
      </View>

      <ReceiptFieldSmart control={control} name="receipt" currentReceipt={currentReceipt} />
      {notice}

      <View style={styles.spacer} />
      <Button label={submitLabel} onPress={submit} isLoading={formState.isSubmitting} />
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  tagGroup: { gap: theme.spacing.small },
  spacer: { height: theme.spacing.large },
  footer: { alignItems: 'center' },
}));
