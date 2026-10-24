import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { Screen } from '@/shared/components/Screen/Screen';
import { APP_VERSION } from '@/shared/constants/appVersion';

import { doSignInWithGoogle } from '@/features/auth/pages/SignInPage/utils/actions/doSignInWithGoogle';

export function SignInPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signIn() {
    setIsSigningIn(true);
    await doSignInWithGoogle();
    setIsSigningIn(false);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="displaySmall">Livro-Caixa</AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          As contas da família, cada uma com o comprovante.
        </AppText>
        <Button label="Entrar com Google" onPress={signIn} isLoading={isSigningIn} />
      </View>
      <AppText variant="labelSmall" color="onSurfaceVariant" style={styles.version}>
        {`Versão ${APP_VERSION}`}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { flex: 1, justifyContent: 'center', gap: theme.spacing.extraLarge, padding: theme.spacing.extraLarge },
  version: { textAlign: 'center', paddingBottom: theme.spacing.extraLarge },
}));
