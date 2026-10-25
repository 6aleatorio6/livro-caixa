import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { DateFieldSmart } from '@/shared/components/inputs/DateFieldSmart/DateFieldSmart';
import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';
import { ReceiptFieldSmart } from '@/shared/components/inputs/ReceiptFieldSmart/ReceiptFieldSmart';
import { TagChoiceSmart } from '@/shared/components/inputs/TagChoiceSmart/TagChoiceSmart';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import type { ITag } from '@/shared/types/tag/Tag';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

import { useOneOffBillForm } from '@/features/payments/hooks/useOneOffBillForm/useOneOffBillForm';
import { oneOffBillInputOf } from '@/features/payments/utils/oneOffBillInputOf';

export interface IOneOffBillFormProps {
  /** As tags para escolher. */
  tags: ITag[];
  /** A leitura das tags falhou: `tags` está vazia por isso. */
  hasTagsError: boolean;
  /** Recebe a entrada já convertida; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IOneOffBillInput) => Promise<void>;
}

/** O formulário da conta avulsa: já paga, em nome de quem registra, com o comprovante. */
export function OneOffBillForm({ tags, hasTagsError, onSubmit }: IOneOffBillFormProps) {
  const { control, handleSubmit, formState } = useOneOffBillForm(undefined, { date: toIsoDate(new Date()) });

  const submit = handleSubmit((values) => onSubmit(oneOffBillInputOf(values)));

  return (
    <View style={styles.form}>
      <TextFieldSmart control={control} name="name" label="Nome da conta" autoCapitalize="sentences" />
      <MoneyFieldSmart control={control} name="amountCents" label="Valor pago" />
      <DateFieldSmart
        control={control}
        name="date"
        label="Data"
        supportText="Hoje, por padrão. A data define o mês em que a conta entra."
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

      <ReceiptFieldSmart control={control} name="receipt" />
      <OwnershipNotice subject="esta conta" />

      <View style={styles.spacer} />
      <Button label="Registrar conta avulsa" onPress={submit} isLoading={formState.isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  tagGroup: { gap: theme.spacing.small },
  spacer: { height: theme.spacing.large },
}));
