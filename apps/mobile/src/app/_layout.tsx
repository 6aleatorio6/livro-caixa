import { Stack } from 'expo-router';

import { AppContainer } from '@/core/AppContainer';
import { SplashScreenController } from '@/core/components/SplashScreenController/SplashScreenController';
import { useAccess } from '@/features/auth/hooks/useAccess/useAccess';

export default function RootLayout() {
  const { status: accessStatus, isAdmin } = useAccess();

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
          <Stack.Screen name="change-name" />
          <Stack.Screen name="recurring-bills/index" />
          <Stack.Screen name="recurring-bills/new" />
          <Stack.Screen name="recurring-bills/[id]/index" />
          <Stack.Screen name="recurring-bills/[id]/pay" />
          <Stack.Screen name="one-off-bills/new" />
          <Stack.Screen
            name="entries/[id]/index"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="entries/[id]/edit" />
          <Stack.Screen name="entries/[id]/receipt" options={{ animation: 'fade' }} />
          <Stack.Screen name="tags/index" />
          <Stack.Screen name="tags/new" />
          <Stack.Screen name="tags/[id]" />
          <Stack.Protected guard={isAdmin}>
            <Stack.Screen name="allowed-emails" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </AppContainer>
  );
}
