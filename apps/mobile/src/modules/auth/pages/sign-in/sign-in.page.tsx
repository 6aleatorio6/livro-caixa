import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/app-text';
import { Button } from '@/shared/components/button';
import { Screen } from '@/shared/components/screen';

import { doSignInWithGoogle } from './actions/do-sign-in-with-google.action';

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
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { flex: 1, justifyContent: 'center', gap: theme.spacing.extraLarge, padding: theme.spacing.extraLarge },
}));
