import { act } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import type { IAllowedEmail } from '@/shared/types/allowedEmail/AllowedEmail';
import type { IAuthState } from '@/shared/types/auth/AuthState';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import TabsLayout from '@/app/(tabs)/_layout';
import RootLayout from '@/app/_layout';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
// O layout das abas chama o hook do nome, que tem teste próprio e carregaria o serviço de escrita.
jest.mock('@/features/auth/hooks/useEnsureOwnName/useEnsureOwnName', () => ({ useEnsureOwnName: jest.fn() }));

const SIGNED_OUT: IAuthState = { status: 'signedOut' };

/** A sessão e, com ela, a leitura do e-mail na lista; sem sessão, a leitura fica parada. */
async function renderAppAs(
  authState: IAuthState,
  allowedEmail: IServiceScenario<{ email: string | null }, IAllowedEmail | null> | null,
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
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': () => <Text>Página do início</Text>,
      '(tabs)/my-payments': () => <Text>Página dos pagamentos</Text>,
      '(tabs)/settings': () => <Text>Página das configurações</Text>,
      'sign-in': () => <Text>Entrar</Text>,
      'no-access': () => <Text>Sem acesso</Text>,
      'test-sign-in': () => <Text>Entrada de teste</Text>,
      'allowed-emails': () => <Text>Página dos e-mails permitidos</Text>,
      'change-name': () => <Text>Página do seu nome</Text>,
      'recurring-bills/index': () => <Text>Página das contas recorrentes</Text>,
      'recurring-bills/new': () => <Text>Página da nova conta recorrente</Text>,
      'recurring-bills/[id]': () => <Text>Página de alterar conta recorrente</Text>,
      'tags/index': () => <Text>Página das tags</Text>,
      'tags/new': () => <Text>Página da nova tag</Text>,
      'tags/[id]': () => <Text>Página de alterar tag</Text>,
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
    expect(screen.getByText('Página do início')).toBeOnTheScreen();
  });

  it('Should move an allowed person to no-access when the e-mail leaves the list while the app is open', async () => {
    const realtime = await renderAppAs(
      signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
      allowedEmailQueryScenarios.emailRemovedWhileOpen,
    );
    expect(screen.getByText('Página do início')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailQueryService));

    expect(await screen.findByText('Sem acesso')).toBeOnTheScreen();
  });

  it('Should open the app when the e-mail enters the list while the no-access screen is open', async () => {
    const realtime = await renderAppAs(
      signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn),
      allowedEmailQueryScenarios.emailAddedWhileOpen,
    );
    expect(screen.getByText('Sem acesso')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailQueryService));

    expect(await screen.findByText('Página do início')).toBeOnTheScreen();
    expect(screen.queryByText('Sem acesso')).not.toBeOnTheScreen();
    expect(screen.queryByText('Entrar')).not.toBeOnTheScreen();
  });

  describe('The change-name screen', () => {
    it('Should let a member reach /change-name', async () => {
      await renderAppAs(
        signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
        allowedEmailQueryScenarios.emailInList,
        '/change-name',
      );

      expect(screen.getByText('Página do seu nome')).toBeOnTheScreen();
    });

    it('Should keep a signed-out person out of /change-name', async () => {
      await renderAppAs(SIGNED_OUT, null, '/change-name');

      expect(screen.queryByText('Página do seu nome')).not.toBeOnTheScreen();
      expect(screen.getByText('Entrar')).toBeOnTheScreen();
    });
  });

  describe('The tags and recurring bills screens', () => {
    const SCREENS = [
      { url: '/tags', page: 'Página das tags' },
      { url: '/tags/new', page: 'Página da nova tag' },
      { url: '/tags/casa', page: 'Página de alterar tag' },
      { url: '/recurring-bills', page: 'Página das contas recorrentes' },
      { url: '/recurring-bills/new', page: 'Página da nova conta recorrente' },
      { url: '/recurring-bills/internet', page: 'Página de alterar conta recorrente' },
    ];

    it.each(SCREENS)('Should let a member reach $url', async ({ url, page }) => {
      await renderAppAs(
        signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
        allowedEmailQueryScenarios.emailInList,
        url,
      );

      expect(screen.getByText(page)).toBeOnTheScreen();
    });

    it.each(SCREENS)('Should keep a signed-out person out of $url', async ({ url, page }) => {
      await renderAppAs(SIGNED_OUT, null, url);

      expect(screen.queryByText(page)).not.toBeOnTheScreen();
      expect(screen.getByText('Entrar')).toBeOnTheScreen();
    });
  });

  describe('The allowed-emails screen', () => {
    it('Should keep a member out of /allowed-emails', async () => {
      await renderAppAs(
        signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn),
        allowedEmailQueryScenarios.emailInList,
        '/allowed-emails',
      );

      expect(screen.queryByText('Página dos e-mails permitidos')).not.toBeOnTheScreen();
      expect(screen.getByText('Página do início')).toBeOnTheScreen();
    });

    it('Should let the admin reach /allowed-emails', async () => {
      await renderAppAs(
        signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn),
        allowedEmailQueryScenarios.adminInList,
        '/allowed-emails',
      );

      expect(screen.getByText('Página dos e-mails permitidos')).toBeOnTheScreen();
    });

    it('Should take the admin off /allowed-emails when the admin flag is lost while it is open', async () => {
      const realtime = await renderAppAs(
        signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn),
        allowedEmailQueryScenarios.adminLosesAdminWhileOpen,
        '/allowed-emails',
      );
      expect(screen.getByText('Página dos e-mails permitidos')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(allowedEmailQueryService));

      expect(await screen.findByText('Página do início')).toBeOnTheScreen();
      expect(screen.queryByText('Página dos e-mails permitidos')).not.toBeOnTheScreen();
    });
  });
});
