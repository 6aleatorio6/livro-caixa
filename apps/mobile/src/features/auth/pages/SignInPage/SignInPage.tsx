import { useState } from 'react';
import { LogIn } from 'lucide-react-native';
import { Image, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { Screen } from '@/shared/components/Screen/Screen';
import markDark from '@/assets/images/sign-in-mark-dark.png';
import markLight from '@/assets/images/sign-in-mark.png';
import { APP_VERSION } from '@/shared/constants/appVersion';

import { doSignInWithGoogle } from '@/features/auth/pages/SignInPage/utils/actions/doSignInWithGoogle';

export function SignInPage() {
  const { rt } = useUnistyles();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signIn() {
    setIsSigningIn(true);
    await doSignInWithGoogle();
    setIsSigningIn(false);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Decorative>
          <Image source={rt.themeName === 'dark' ? markDark : markLight} style={styles.mark} />
        </Decorative>
        <AppText variant="displaySmallEmphasized">Livro-Caixa</AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          As contas da família, cada uma com o comprovante.
        </AppText>
        <View style={styles.space} />
        <Button label="Entrar com Google" icon={LogIn} onPress={signIn} isLoading={isSigningIn} />
        <AppText variant="bodySmall" color="onSurfaceVariant">
          Entra só quem a família liberou.
        </AppText>
      </View>
      <AppText variant="labelSmall" color="onSurfaceVariant" style={styles.version}>
        {`Versão ${APP_VERSION}`}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.extraExtraLarge,
    paddingBottom: theme.spacing.extraExtraExtraLarge,
  },
  mark: { width: 96, height: 96 },
  space: { height: theme.spacing.extraLarge },
  version: { textAlign: 'center', paddingBottom: theme.spacing.extraLarge },
}));
