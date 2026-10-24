import { act, render, screen, userEvent } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signOutService } from '@/shared/services/auth/signOutService';
import { signOutScenarios } from '@/shared/services/auth/signOutService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { APP_VERSION } from '@/shared/constants/appVersion';

import { SettingsPage } from './SettingsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/auth/signOutService', () => ({ signOutService: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SettingsPage', () => {
  describe('as the admin', () => {
    beforeEach(() => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
    });

    it('Should show the allowed e-mails entry and the admin mark', async () => {
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.adminInList });
      await render(<SettingsPage />);

      expect(screen.getByText('Só para o admin')).toBeOnTheScreen();
      expect(screen.getByText('E-mails permitidos')).toBeOnTheScreen();
      expect(screen.getByText('Admin · você')).toBeOnTheScreen();
    });

    it('Should hide the allowed e-mails entry when the admin loses the admin flag with the screen open', async () => {
      const realtime = mockRealtime({
        service: allowedEmailQueryService,
        scenario: allowedEmailQueryScenarios.adminLosesAdminWhileOpen,
      });
      await render(<SettingsPage />);
      expect(screen.getByText('E-mails permitidos')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(allowedEmailQueryService));

      expect(screen.queryByText('E-mails permitidos')).not.toBeOnTheScreen();
      expect(screen.queryByText('Admin · você')).not.toBeOnTheScreen();
    });
  });

  describe('as a member', () => {
    beforeEach(() => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList });
    });

    it('Should show neither the allowed e-mails entry nor the admin mark', async () => {
      await render(<SettingsPage />);

      expect(screen.queryByText('E-mails permitidos')).not.toBeOnTheScreen();
      expect(screen.queryByText('Admin · você')).not.toBeOnTheScreen();
    });

    it('Should show the name and the e-mail of the scenario and the family entries', async () => {
      await render(<SettingsPage />);

      expect(screen.getByText('Bruno Souza')).toBeOnTheScreen();
      expect(screen.getByText('bruno.souza@exemplo.com')).toBeOnTheScreen();
      expect(screen.getByText('Contas recorrentes')).toBeOnTheScreen();
      expect(screen.getByText('Tags')).toBeOnTheScreen();
    });

    it('Should sign out when Sair is pressed', async () => {
      mockServiceScenario(signOutService, signOutScenarios.memberSignsOut);
      const user = userEvent.setup();
      await render(<SettingsPage />);

      await user.press(screen.getByRole('button', { name: 'Sair' }));

      // Sem entrada no cenário: o `createAsyncAction` chama o serviço com um `undefined`, que não conta.
      expect(signOutService).toHaveBeenCalledTimes(1);
    });

    it('Should show the app version', async () => {
      await render(<SettingsPage />);

      expect(screen.getByText(`Livro-Caixa · versão ${APP_VERSION}`)).toBeOnTheScreen();
    });

    it('Should not announce the entries as buttons', async () => {
      await render(<SettingsPage />);

      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });
});
