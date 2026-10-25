import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signOutService } from '@/shared/services/auth/signOutService';
import { signOutScenarios } from '@/shared/services/auth/signOutService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { APP_VERSION } from '@/shared/constants/appVersion';

import { SettingsPage } from './SettingsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/shared/services/auth/signOutService', () => ({ signOutService: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

function adminInList() {
  return [
    { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.adminInList },
    familyList(),
    tagList(),
  ] as const;
}

function tagList(scenario: (typeof tagListQueryScenarios)[keyof typeof tagListQueryScenarios] = tagListQueryScenarios.threeTags) {
  return { service: tagListQueryService, scenario };
}

function familyList() {
  return { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
}

describe('SettingsPage', () => {
  describe('as the admin', () => {
    beforeEach(() => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
    });

    it('Should show the allowed e-mails entry and the admin mark', async () => {
      mockRealtime(...adminInList());
      await render(<SettingsPage />);

      expect(screen.getByText('Só para o admin')).toBeOnTheScreen();
      expect(screen.getByText('E-mails permitidos')).toBeOnTheScreen();
      expect(screen.getByText('Admin · você')).toBeOnTheScreen();
    });

    it('Should show how many people are in the family on the allowed e-mails entry', async () => {
      mockRealtime(...adminInList());
      await render(<SettingsPage />);

      expect(screen.getByText('3 pessoas na família')).toBeOnTheScreen();
    });

    it('Should open the allowed e-mails screen when its entry is pressed', async () => {
      mockRealtime(...adminInList());
      await render(<SettingsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: /E-mails permitidos/ }));

      expect(router.push).toHaveBeenCalledWith('/allowed-emails');
    });

    it('Should hide the allowed e-mails entry when the admin loses the admin flag with the screen open', async () => {
      const realtime = mockRealtime(
        { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.adminLosesAdminWhileOpen },
        familyList(),
        tagList(),
      );
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
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList }, tagList());
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

    it('Should open the change name screen when the pencil is pressed', async () => {
      await render(<SettingsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Alterar nome' }));

      expect(router.push).toHaveBeenCalledWith('/change-name');
    });

    it('Should sign out when Sair is pressed', async () => {
      mockServiceScenario(signOutService, signOutScenarios.memberSignsOut);
      const user = userEvent.setup();
      await render(<SettingsPage />);

      await user.press(screen.getByRole('button', { name: 'Sair da conta' }));

      // Sem entrada no cenário: o `createAsyncAction` chama o serviço com um `undefined`, que não conta.
      expect(signOutService).toHaveBeenCalledTimes(1);
    });

    it('Should show the app version', async () => {
      await render(<SettingsPage />);

      expect(screen.getByText(`Livro-Caixa · versão ${APP_VERSION}`)).toBeOnTheScreen();
    });

    it('Should open the tags screen when the Tags entry is pressed', async () => {
      await render(<SettingsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Tags' }));

      expect(router.push).toHaveBeenCalledWith('/tags');
    });

    it('Should list the names of the tags in order on the Tags entry', async () => {
      await render(<SettingsPage />);

      expect(screen.getByText('Casa, Saúde, Serviços')).toBeOnTheScreen();
    });

    it('Should say there is no tag on the Tags entry when the family has none', async () => {
      mockRealtime(
        { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList },
        tagList(tagListQueryScenarios.noTagsDocument),
      );
      await render(<SettingsPage />);

      expect(screen.getByText('Nenhuma tag')).toBeOnTheScreen();
    });

    it('Should announce as buttons only the entries that lead somewhere', async () => {
      await render(<SettingsPage />);

      // Os dois da pessoa logada (Alterar nome e Sair da conta) e Tags; as contas recorrentes ainda não têm tela.
      expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual([
        'Alterar nome',
        'Sair da conta',
        'Tags',
      ]);
    });
  });

  describe('as a person who has not entered yet', () => {
    it('Should show the e-mail in place of the name, once', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailWithoutName }, tagList());
      await render(<SettingsPage />);

      expect(screen.getAllByText('carla.lima@exemplo.com')).toHaveLength(1);
    });
  });
});
