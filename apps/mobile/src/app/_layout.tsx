import { Stack } from 'expo-router';

import { AppContainer } from '@/core/AppContainer';

export default function RootLayout() {
  return (
    <AppContainer>
      <Stack screenOptions={{ headerShown: false }} />
    </AppContainer>
  );
}
