import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/shared/components/Button/Button';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';

import { useChangeNameForm } from '@/features/settings/pages/ChangeNamePage/hooks/useChangeNameForm/useChangeNameForm';
import { doChangeOwnName } from '@/features/settings/pages/ChangeNamePage/utils/actions/doChangeOwnName';

export interface IChangeNameFormProps {
  email: string;
  currentName: string;
  /** Chamado depois que o nome novo foi gravado. */
  onSaved: () => void;
}

/** O campo do nome e o botão que o grava; o nome é aparado antes de chegar ao serviço. */
export function ChangeNameForm({ email, currentName, onSaved }: IChangeNameFormProps) {
  const { control, handleSubmit, formState } = useChangeNameForm(undefined, { name: currentName });

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await doChangeOwnName({ email, name: values.name });
    if (!error) onSaved();
  });

  return (
    <View style={styles.form}>
      <TextFieldSmart
        control={control}
        name="name"
        label="Nome"
        supportText="É o nome que a família vê nos seus lançamentos e na divisão por membro."
        autoCapitalize="words"
      />
      <View style={styles.spacer} />
      <Button label="Salvar nome" onPress={onSubmit} isLoading={formState.isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.largeIncreased },
  spacer: { height: theme.spacing.extraLarge },
}));
