import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { SmartRequiredMark } from '@/shared/components/inputs/SmartRequiredMark/SmartRequiredMark';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import type { ITag } from '@/shared/types/tag/Tag';

import { ColorPickerSmart } from '@/features/tags/components/ColorPickerSmart/ColorPickerSmart';
import { useTagForm } from '@/features/tags/hooks/useTagForm/useTagForm';

/** O que o formulário entrega: o que `createTagService` pede, e `updateTagService` pede com o id. */
type ITagFormValues = Pick<ITag, 'name' | 'color'>;

export interface ITagFormProps {
  /** As tags carregadas, contra as quais o nome é comparado. */
  tags: ITag[];
  /** Ao alterar, a tag aberta: ela não conta como repetida de si mesma. */
  tagId?: string;
  initialValues?: ITagFormValues;
  /** O botão principal ("Criar tag", "Salvar alterações"). */
  submitLabel: string;
  /** Só com a lista carregada a checagem do nome tem com o que comparar. */
  isListLoaded: boolean;
  /** Recebe o nome já aparado; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (values: ITagFormValues) => Promise<void>;
  /** O que vem depois do botão principal (a exclusão, ao alterar). */
  children?: ReactNode;
}

/** O formulário da tag, o mesmo ao criar e ao alterar: o nome, a cor, a prévia e o botão que grava. */
export function TagForm({ tags, tagId, initialValues, submitLabel, isListLoaded, onSubmit, children }: ITagFormProps) {
  const { control, handleSubmit, formState } = useTagForm({ tags, tagId }, initialValues);
  const [name, color] = useWatch({ control, name: ['name', 'color'] });

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.form}>
      <TextFieldSmart
        control={control}
        name="name"
        label="Nome da tag"
        supportText="O nome não se repete: “Saúde” e “saude” são a mesma tag."
        autoCapitalize="sentences"
      />

      <View style={styles.colorGroup}>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          Cor
          <SmartRequiredMark control={control} names={['color']} />
        </AppText>
        <ColorPickerSmart control={control} name="color" />
      </View>

      <View style={styles.preview}>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          Como fica:
        </AppText>
        <TagChip name={name.trim() || 'Nome da tag'} color={color} />
      </View>

      <View style={styles.spacer} />
      <Button label={submitLabel} onPress={submit} isLoading={formState.isSubmitting} disabled={!isListLoaded} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  colorGroup: { gap: theme.spacing.smallIncreased },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.medium,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  spacer: { height: theme.spacing.large },
}));
