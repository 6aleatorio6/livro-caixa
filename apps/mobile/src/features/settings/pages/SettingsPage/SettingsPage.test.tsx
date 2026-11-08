import { act, render, screen, userEvent } from '@testing-library/react-native';
import { authenticateAsync, isEnrolledAsync } from 'expo-local-authentication';
import { router } from 'expo-router';

import { useToastStore } from '@/core/store/toast.store';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signOutService } from '@/shared/services/auth/signOutService';
import { signOutScenarios } from '@/shared/services/auth/signOutService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { APP_VERSION } from '@/shared/constants/appVersion';
import { useBiometricLockStore } from '@/shared/store/biometricLock.store';
import { writeBiometricsEnabled } from '@/shared/utils/biometrics/writeBiometricsEnabled';

import { SettingsPage } from './SettingsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/shared/services/auth/signOutService', () => ({ signOutService: jest.fn() }));
// A biblioteca nativa e o arquivo da opção (que o teste do arquivo cobre) ficam de fora: a página só decide o que
// pedir e o que gravar.
jest.mock('expo-local-authentication', () => ({ isEnrolledAsync: jest.fn(), authenticateAsync: jest.fn() }));
jest.mock('@/shared/utils/biometrics/writeBiometricsEnabled', () => ({ writeBiometricsEnabled: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  // `clearAllMocks` não tira o que um teste anterior programou: cada teste começa num celular sem biometria.
  jest.mocked(isEnrolledAsync).mockResolvedValue(false);
  useBiometricLockStore.setState(useBiometricLockStore.getInitialState());
  useToastStore.setState({ toast: null });
});

function adminInList() {
  return [
    { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.adminInList },
    familyList(),
    tagList(),
    billList(),
  ] as const;
}

function tagList(scenario: (typeof tagListQueryScenarios)[keyof typeof tagListQueryScenarios] = tagListQueryScenarios.threeTags) {
  return { service: tagListQueryService, scenario };
}

function billList(
  scenario: (typeof recurringBillListQueryScenarios)[keyof typeof recurringBillListQueryScenarios] = recurringBillListQueryScenarios.fiveBills,
) {
  return { service: recurringBillListQueryService, scenario };
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
        billList(),
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
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList }, tagList(), billList());
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

    it('Should open the recurring bills screen when the Contas recorrentes entry is pressed', async () => {
      await render(<SettingsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Contas recorrentes' }));

      expect(router.push).toHaveBeenCalledWith('/recurring-bills');
    });

    it('Should give the count and the monthly total on the Contas recorrentes entry', async () => {
      await render(<SettingsPage />);

      expect(screen.getByText('5 contas · R$ 2.677,90 por mês')).toBeOnTheScreen();
    });

    it('Should announce as buttons only the entries that lead somewhere', async () => {
      await render(<SettingsPage />);

      // Os dois da pessoa logada (Alterar nome e Sair da conta) e as duas linhas da família.
      expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual([
        'Alterar nome',
        'Sair da conta',
        'Contas recorrentes',
        'Tags',
      ]);
    });

    describe('Biometrics option', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      function allowBiometrics() {
        jest.mocked(isEnrolledAsync).mockResolvedValue(true);
      }

      it('Should not show the section on a phone without a fingerprint or face registered', async () => {
        await render(<SettingsPage />);

        expect(screen.queryByText('Neste celular')).not.toBeOnTheScreen();
        expect(screen.queryByRole('switch', { name: 'Entrar com biometria' })).not.toBeOnTheScreen();
      });

      it('Should show the section with the option off when the phone has a fingerprint or face registered', async () => {
        allowBiometrics();
        await render(<SettingsPage />);

        expect(await screen.findByText('Neste celular')).toBeOnTheScreen();
        expect(
          screen.getByText('Pede a digital ou o rosto ao abrir o app e depois de 10 minutos fora'),
        ).toBeOnTheScreen();
        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).not.toBeChecked();
      });

      it('Should show the option on when it was turned on before', async () => {
        allowBiometrics();
        useBiometricLockStore.setState({ isEnabled: true });
        await render(<SettingsPage />);

        expect(await screen.findByRole('switch', { name: 'Entrar com biometria' })).toBeChecked();
      });

      // O bloqueio continua pedindo (pelo PIN do aparelho) com a opção ligada: sem a linha, a pessoa não a desliga.
      it('Should keep the section with the option on, so it can be turned off, after the biometrics were removed from the phone', async () => {
        useBiometricLockStore.setState({ isEnabled: true });
        const user = userEvent.setup();
        await render(<SettingsPage />);

        const option = await screen.findByRole('switch', { name: 'Entrar com biometria' });
        expect(option).toBeChecked();
        await user.press(option);

        expect(authenticateAsync).not.toHaveBeenCalled();
        expect(writeBiometricsEnabled).toHaveBeenCalledWith(false);
        expect(screen.queryByText('Neste celular')).not.toBeOnTheScreen();
      });

      it('Should ask for the biometrics once and turn the option on and write it when it succeeds', async () => {
        allowBiometrics();
        jest.mocked(authenticateAsync).mockResolvedValue({ success: true });
        const user = userEvent.setup();
        await render(<SettingsPage />);

        await user.press(await screen.findByRole('switch', { name: 'Entrar com biometria' }));

        expect(authenticateAsync).toHaveBeenCalledTimes(1);
        expect(authenticateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ promptMessage: 'Confirme para ligar a entrada com biometria' }),
        );
        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).toBeChecked();
        expect(writeBiometricsEnabled).toHaveBeenCalledWith(true);
      });

      // A pessoa acabou de passar pela biometria para ligar a opção: o app só pede de novo na próxima abertura.
      it('Should not lock the app on the spot when the option is turned on', async () => {
        allowBiometrics();
        jest.mocked(authenticateAsync).mockResolvedValue({ success: true });
        const user = userEvent.setup();
        await render(<SettingsPage />);

        await user.press(await screen.findByRole('switch', { name: 'Entrar com biometria' }));

        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).toBeChecked();
        expect(useBiometricLockStore.getState().isLocked).toBe(false);
      });

      it('Should keep the option off and write nothing when the person cancels the biometrics', async () => {
        allowBiometrics();
        jest.mocked(authenticateAsync).mockResolvedValue({ success: false, error: 'user_cancel' });
        const user = userEvent.setup();
        await render(<SettingsPage />);

        await user.press(await screen.findByRole('switch', { name: 'Entrar com biometria' }));

        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).not.toBeChecked();
        expect(writeBiometricsEnabled).not.toHaveBeenCalled();
        expect(useToastStore.getState().toast).toBeNull();
      });

      it('Should turn the option off and write it without asking for the biometrics', async () => {
        allowBiometrics();
        useBiometricLockStore.setState({ isEnabled: true });
        const user = userEvent.setup();
        await render(<SettingsPage />);

        await user.press(await screen.findByRole('switch', { name: 'Entrar com biometria' }));

        expect(authenticateAsync).not.toHaveBeenCalled();
        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).not.toBeChecked();
        expect(writeBiometricsEnabled).toHaveBeenCalledWith(false);
      });

      it('Should keep the option off and show an error when the file cannot be written', async () => {
        // Relógio falso para o aviso não deixar o tempo de esconder (4 s) pendente depois do teste.
        jest.useFakeTimers();
        allowBiometrics();
        jest.mocked(authenticateAsync).mockResolvedValue({ success: true });
        jest.mocked(writeBiometricsEnabled).mockImplementationOnce(() => {
          throw new Error('Sem espaço no armazenamento');
        });
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        await render(<SettingsPage />);

        await user.press(await screen.findByRole('switch', { name: 'Entrar com biometria' }));

        expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).not.toBeChecked();
        expect(useToastStore.getState().toast).toEqual({ message: 'Algo deu errado. Tente de novo.', kind: 'error' });
      });
    });
  });

  describe('as a person who has not entered yet', () => {
    it('Should show the e-mail in place of the name, once', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
      mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailWithoutName }, tagList(), billList());
      await render(<SettingsPage />);

      expect(screen.getAllByText('carla.lima@exemplo.com')).toHaveLength(1);
    });
  });
});
