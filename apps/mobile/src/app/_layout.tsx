import { Stack } from 'expo-router';

import { AppContainer } from '@/core/app-container';

export default function RootLayout() {
  return (
    <AppContainer>
      <Stack screenOptions={{ headerShown: false }} />
    </AppContainer>
  );
}
