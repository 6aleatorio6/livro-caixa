import { router } from 'expo-router';
import { Repeat } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';

/** O convite do Início sem nenhuma conta recorrente cadastrada: leva à lista para cadastrá-las. */
export function NoBillsPrompt() {
  return (
    <View style={styles.container}>
      <AppText variant="titleMediumEmphasized">Nenhuma conta recorrente ainda</AppText>
      <AppText variant="bodyMedium" color="onSurfaceVariant">
        Cadastre as contas que a família paga todo mês. Elas aparecem aqui como a pagar, e o anel fecha conforme
        vocês pagam.
      </AppText>
      <Button
        label="Cadastrar contas recorrentes"
        variant="tonal"
        icon={Repeat}
        onPress={() => router.push('/recurring-bills')}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.spacing.medium, paddingVertical: theme.spacing.small },
}));
