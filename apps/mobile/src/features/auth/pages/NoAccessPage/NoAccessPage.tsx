import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { Screen } from '@/shared/components/Screen/Screen';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

import { doSignOut } from '@/features/auth/pages/NoAccessPage/utils/actions/doSignOut';
import { signedInEmail } from '@/features/auth/utils/signedInEmail';

/** Para quem entrou com um e-mail do Google fora da lista: só o aviso e a saída. */
export function NoAccessPage() {
  const email = signedInEmail(useAuthState());
  const whichEmail = email ? `O e-mail ${email}` : 'Este e-mail';

  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="headlineSmall">Você não tem acesso</AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          {`${whichEmail} não está liberado. Peça a quem administra o Livro-Caixa para liberá-lo.`}
        </AppText>
        <Button label="Sair" variant="outlined" onPress={() => doSignOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { flex: 1, justifyContent: 'center', gap: theme.spacing.large, padding: theme.spacing.extraLarge },
}));
