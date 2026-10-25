import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { DateFieldSmart } from '@/shared/components/inputs/DateFieldSmart/DateFieldSmart';
import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';
import type { ITag } from '@/shared/types/tag/Tag';
import { firstDayOfThisMonth } from '@/shared/utils/date/firstDayOfThisMonth';
import { formatCents } from '@/shared/utils/format/formatCents';

import { EditNotice } from '@/features/recurringBills/components/EditNotice/EditNotice';
import { TagChoiceSmart } from '@/features/recurringBills/components/TagChoiceSmart/TagChoiceSmart';
import { useRecurringBillForm } from '@/features/recurringBills/hooks/useRecurringBillForm/useRecurringBillForm';
import { recurringBillFormValuesOf } from '@/features/recurringBills/utils/recurringBillFormValuesOf';
import { recurringBillInputOf } from '@/features/recurringBills/utils/recurringBillInputOf';

export interface IRecurringBillFormProps {
  /** As tags para escolher. */
  tags: ITag[];
  /** A leitura das tags falhou: `tags` está vazia por isso, e a tag da conta aberta fica como está. */
  hasTagsError: boolean;
  /** Ao alterar, a conta aberta: o formulário começa com ela, mostra o aviso e o valor de antes. */
  bill?: IRecurringBill;
  /** O botão principal ("Cadastrar conta", "Salvar alterações"). */
  submitLabel: string;
  /** Recebe a entrada já convertida; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IRecurringBillInput) => Promise<void>;
  /** O que vem depois do botão principal (a exclusão, ao alterar). */
  children?: ReactNode;
}

/** O formulário da conta recorrente, o mesmo ao cadastrar e ao alterar. */
export function RecurringBillForm({ tags, hasTagsError, bill, submitLabel, onSubmit, children }: IRecurringBillFormProps) {
  const { control, handleSubmit, formState } = useRecurringBillForm(
    undefined,
    bill ? recurringBillFormValuesOf(bill, hasTagsError ? null : tags) : { startsOn: firstDayOfThisMonth() },
  );
  const amountCents = useWatch({ control, name: 'amountCents' });

  const submit = handleSubmit((values) => onSubmit(recurringBillInputOf(values)));

  // Ao alterar, o apoio mostra o valor de antes enquanto o campo estiver diferente dele.
  const wasAmountChanged = bill !== undefined && amountCents !== null && amountCents !== bill.expectedAmountCents;
  const amountBefore = wasAmountChanged ? `Era ${formatCents(bill.expectedAmountCents)}.` : undefined;
  const amountSupport = bill ? amountBefore : 'Quem paga confirma ou corrige este valor no pagamento.';

  return (
    <View style={styles.form}>
      {bill ? <EditNotice /> : null}

      <TextFieldSmart control={control} name="name" label="Nome da conta" autoCapitalize="sentences" />
      <MoneyFieldSmart control={control} name="amountCents" label="Valor previsto" supportText={amountSupport} />
      <TextFieldSmart
        control={control}
        name="dayOfMonth"
        label="Dia do mês"
        keyboardType="number-pad"
        supportText="De 1 a 31. Num mês mais curto, vence no último dia."
      />
      <DateFieldSmart
        control={control}
        name="startsOn"
        label="Vale a partir de"
        supportText={bill ? undefined : 'Antes desta data, a conta não aparece no Início.'}
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

      <View style={styles.spacer} />
      <Button label={submitLabel} onPress={submit} isLoading={formState.isSubmitting} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  tagGroup: { gap: theme.spacing.small },
  spacer: { height: theme.spacing.large },
}));
