import { Stack } from 'expo-router';

import { AppContainer } from '@/core/AppContainer';
import { SplashScreenController } from '@/core/components/SplashScreenController/SplashScreenController';
import { useAccess } from '@/features/auth/hooks/useAccess/useAccess';

export default function RootLayout() {
  const accessStatus = useAccess();

  // Enquanto a sessão carrega, a splash cobre a tela de login, que é a única liberada.
  return (
    <AppContainer>
      <SplashScreenController isLoading={accessStatus === 'loading'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={accessStatus === 'signedOut' || accessStatus === 'loading'}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="test-sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={accessStatus === 'denied'}>
          <Stack.Screen name="no-access" />
        </Stack.Protected>
        <Stack.Protected guard={accessStatus === 'allowed'}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </AppContainer>
  );
}
