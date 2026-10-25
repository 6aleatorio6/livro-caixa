import { UserPlus } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

import { useAddPersonForm } from '@/features/allowedEmails/pages/AllowedEmailsPage/hooks/useAddPersonForm/useAddPersonForm';
import { doAddAllowedEmail } from '@/features/allowedEmails/pages/AllowedEmailsPage/utils/actions/doAddAllowedEmail';

export interface IAddPersonCardProps {
  /** A lista carregada, contra a qual o e-mail novo é comparado. */
  people: IAllowedEmailListItem[];
  /** Só com a lista carregada a checagem de e-mail repetido tem com o que comparar. */
  isListLoaded: boolean;
}

/** O cartão em que o admin coloca uma pessoa na lista; depois de adicionar, o campo volta vazio. */
export function AddPersonCard({ people, isListLoaded }: IAddPersonCardProps) {
  const { control, handleSubmit, reset, formState } = useAddPersonForm({ people });

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await doAddAllowedEmail(values);
    if (!error) reset();
  });

  return (
    <View style={styles.card}>
      <AppText variant="titleMediumEmphasized">Adicionar pessoa</AppText>
      <TextFieldSmart
        control={control}
        name="email"
        label="E-mail do Google"
        supportText="A pessoa entra com a conta Google deste e-mail, e o nome vem dela."
        keyboardType="email-address"
        autoCapitalize="none"
        surfaceColor="surfaceContainerLow"
      />
      <Button
        label="Adicionar à família"
        variant="tonal"
        icon={UserPlus}
        onPress={onSubmit}
        isLoading={formState.isSubmitting}
        disabled={!isListLoaded}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.large,
    padding: theme.spacing.largeIncreased,
    borderRadius: theme.radii.largeIncreased,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
}));
