import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';

import { EMULATOR_HOST } from '@/shared/services/firebase/emulatorHost';

import { doFakeGoogleSignIn } from '@/features/auth/pages/TestSignInPage/utils/actions/doFakeGoogleSignIn';

/**
 * A entrada das jornadas: `livrocaixa://test-sign-in?email=…&name=…` entra com o Google falso do
 * emulador. Com o app no projeto real, a conta inventada não passaria, e a tela volta ao login.
 */
export function TestSignInPage() {
  const { email, name } = useLocalSearchParams<{ email: string; name: string }>();

  useEffect(() => {
    if (EMULATOR_HOST && email) doFakeGoogleSignIn({ email, name: name ?? email });
  }, [email, name]);

  if (!EMULATOR_HOST || !email) return <Redirect href="/sign-in" />;

  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="bodyLarge" color="onSurfaceVariant">{`Entrando como ${email}…`}</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { flex: 1, justifyContent: 'center', padding: theme.spacing.extraLarge },
}));
