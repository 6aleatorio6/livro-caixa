import { Text } from 'react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useAccess } from '@/features/auth/hooks/useAccess/useAccess';

import RootLayout from '@/app/_layout';

jest.mock('@/features/auth/hooks/useAccess/useAccess', () => ({ useAccess: jest.fn() }));

async function renderAppAs(accessStatus: ReturnType<typeof useAccess>, initialUrl = '/') {
  (useAccess as jest.Mock).mockReturnValue(accessStatus);
  await renderRouter(
    {
      _layout: RootLayout,
      index: () => <Text>Início</Text>,
      'sign-in': () => <Text>Entrar</Text>,
      'no-access': () => <Text>Sem acesso</Text>,
      'test-sign-in': () => <Text>Entrada de teste</Text>,
    },
    { initialUrl },
  );
}

describe('RootLayout', () => {
  it('Should show the sign-in screen to a signed-out person', async () => {
    await renderAppAs('signedOut');
    expect(screen.getByText('Entrar')).toBeOnTheScreen();
  });

  it('Should show the no-access screen to an e-mail outside the allowed list', async () => {
    await renderAppAs('denied');
    expect(screen.getByText('Sem acesso')).toBeOnTheScreen();
  });

  it("Should open the journeys' sign-in link to a signed-out person", async () => {
    await renderAppAs('signedOut', '/test-sign-in');
    expect(screen.getByText('Entrada de teste')).toBeOnTheScreen();
  });

  it('Should open the app for an allowed e-mail', async () => {
    await renderAppAs('allowed');
    expect(screen.getByText('Início')).toBeOnTheScreen();
  });
});
