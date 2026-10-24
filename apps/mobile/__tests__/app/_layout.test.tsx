import { act } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import type { IAuthState } from '@/shared/types/auth/AuthState';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import RootLayout from '@/app/_layout';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));

const SIGNED_OUT: IAuthState = { status: 'signedOut' };

/** A sessão e, com ela, a leitura do e-mail na lista; sem sessão, a leitura fica parada. */
async function renderAppAs(
  authState: IAuthState,
  allowedEmail: IServiceScenario<{ email: string | null }, boolean> | null,
  initialUrl = '/',
) {
  jest.mocked(useAuthState).mockReturnValue(authState);
  const realtime = mockRealtime(
    allowedEmail
      ? { service: allowedEmailQueryService, scenario: allowedEmail }
      : { service: allowedEmailQueryService, status: 'idle' },
  );
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
  return realtime;
}

describe('RootLayout', () => {
  it('Should show the sign-in screen to a signed-out person', async () => {
    await renderAppAs(SIGNED_OUT, null);
    expect(screen.getByText('Entrar')).toBeOnTheScreen();
  });

  it('Should show the no-access screen to an e-mail outside the allowed list', async () => {
    await renderAppAs(
      signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn),
      allowedEmailQueryScenarios.emailOutsideList,
    );
    expect(screen.getByText('Sem acesso')).toBeOnTheScreen();
  });

  it("Should open the journeys' sign-in link to a signed-out person", async () => {
    await renderAppAs(SIGNED_OUT, null, '/test-sign-in');
    expect(screen.getByText('Entrada de teste')).toBeOnTheScreen();
  });

  it('Should open the app for an allowed e-mail', async () => {
    await renderAppAs(
      signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
      allowedEmailQueryScenarios.emailInList,
    );
    expect(screen.getByText('Início')).toBeOnTheScreen();
  });

  it('Should move an allowed person to no-access when the e-mail leaves the list while the app is open', async () => {
    const realtime = await renderAppAs(
      signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
      allowedEmailQueryScenarios.emailRemovedWhileOpen,
    );
    expect(screen.getByText('Início')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailQueryService));

    expect(await screen.findByText('Sem acesso')).toBeOnTheScreen();
  });
});
