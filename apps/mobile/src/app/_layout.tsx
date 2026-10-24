import { Stack } from 'expo-router';

import { AppContainer } from '@/core/app-container';
import { SplashScreenController } from '@/core/splash-screen-controller';
import { useAccess } from '@/modules/auth/hooks/use-access';

export default function RootLayout() {
  const accessStatus = useAccess();

  // Enquanto a sessão carrega, a splash cobre a tela de login, que é a única liberada.
  return (
    <AppContainer>
      <SplashScreenController isLoading={accessStatus === 'loading'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={accessStatus === 'signedOut' || accessStatus === 'loading'}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={accessStatus === 'denied'}>
          <Stack.Screen name="no-access" />
        </Stack.Protected>
        <Stack.Protected guard={accessStatus === 'allowed'}>
          <Stack.Screen name="index" />
        </Stack.Protected>
      </Stack>
    </AppContainer>
  );
}
