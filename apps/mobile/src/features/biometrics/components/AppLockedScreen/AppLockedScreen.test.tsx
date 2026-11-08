import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { authenticateAsync } from 'expo-local-authentication';

import { useBiometricLockStore } from '@/shared/store/biometricLock.store';
import { holdNextPromptOpen } from '@/shared/testing/holdNextPromptOpen';
import { mockAppState } from '@/shared/testing/mockAppState';
import { lockApp } from '@/shared/utils/biometrics/lockApp';
import { writeBiometricsEnabled } from '@/shared/utils/biometrics/writeBiometricsEnabled';

import { AppLockedScreen } from './AppLockedScreen';

jest.mock('expo-local-authentication', () => ({ authenticateAsync: jest.fn() }));
// Gravar a opção é do `unlockWithBiometrics`, que o layout raiz testa até o arquivo: aqui o arquivo não importa.
jest.mock('@/shared/utils/biometrics/writeBiometricsEnabled', () => ({ writeBiometricsEnabled: jest.fn() }));

let appState: ReturnType<typeof mockAppState>;

beforeEach(() => {
  useBiometricLockStore.setState(useBiometricLockStore.getInitialState());
  lockApp();
  jest.mocked(authenticateAsync).mockReset();
  appState = mockAppState();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AppLockedScreen', () => {
  it('Should ask for the biometrics as soon as it appears, with the device PIN as an alternative', async () => {
    jest.mocked(authenticateAsync).mockResolvedValueOnce({ success: false, error: 'user_cancel' });

    await render(<AppLockedScreen />);

    expect(authenticateAsync).toHaveBeenCalledTimes(1);
    expect(authenticateAsync).toHaveBeenCalledWith({
      promptMessage: 'Abrir o Livro-Caixa',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
  });

  it('Should ask again when the person presses Desbloquear after cancelling', async () => {
    jest.mocked(authenticateAsync).mockResolvedValueOnce({ success: false, error: 'user_cancel' });
    await render(<AppLockedScreen />);
    expect(useBiometricLockStore.getState().isLocked).toBe(true);
    jest.mocked(authenticateAsync).mockResolvedValueOnce({ success: true });

    await userEvent.setup().press(screen.getByRole('button', { name: 'Desbloquear' }));

    expect(authenticateAsync).toHaveBeenCalledTimes(2);
    expect(useBiometricLockStore.getState().isLocked).toBe(false);
  });

  // Só `not_enrolled` abre o app (a biometria sumiu do celular): qualquer outro fim do pedido deixa o app trancado e a
  // opção como estava, para a pessoa tentar de novo.
  it.each(['lockout', 'not_available', 'app_cancel', 'unknown'] as const)(
    'Should stay locked and keep the option on when the prompt ends with %s',
    async (error) => {
      useBiometricLockStore.setState({ isEnabled: true });
      jest.mocked(authenticateAsync).mockResolvedValueOnce({ success: false, error });

      await render(<AppLockedScreen />);

      expect(useBiometricLockStore.getState().isLocked).toBe(true);
      expect(useBiometricLockStore.getState().isEnabled).toBe(true);
      expect(writeBiometricsEnabled).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Desbloquear' })).toBeEnabled();
    },
  );

  it('Should not open a second prompt over the one still open', async () => {
    holdNextPromptOpen();
    await render(<AppLockedScreen />);
    const button = screen.getByRole('button', { name: 'Desbloquear' });

    await userEvent.setup().press(button);

    expect(authenticateAsync).toHaveBeenCalledTimes(1);
    expect(button).toBeBusy();
  });

  it('Should stay locked when the Android back button asks to close it', async () => {
    holdNextPromptOpen();
    await render(<AppLockedScreen />);

    await fireEvent(screen.getByText('Livro-Caixa'), 'requestClose');

    expect(useBiometricLockStore.getState().isLocked).toBe(true);
  });

  describe('When the request fails', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('Should stay locked, with the button ready again, when the system cannot open the prompt', async () => {
      jest.mocked(authenticateAsync).mockRejectedValueOnce(new Error('Sem atividade para mostrar o pedido'));

      await render(<AppLockedScreen />);

      expect(useBiometricLockStore.getState().isLocked).toBe(true);
      expect(screen.getByRole('button', { name: 'Desbloquear' })).toBeEnabled();
      expect(warn).toHaveBeenCalledWith('Não deu para pedir a biometria.', expect.any(Error));
    });

    it('Should open the app when the option cannot be turned off after the biometrics are gone', async () => {
      jest.mocked(authenticateAsync).mockResolvedValueOnce({ success: false, error: 'not_enrolled' });
      jest.mocked(writeBiometricsEnabled).mockImplementationOnce(() => {
        throw new Error('Sem espaço no celular');
      });

      await render(<AppLockedScreen />);

      expect(useBiometricLockStore.getState().isLocked).toBe(false);
      expect(warn).toHaveBeenCalledWith('Não deu para pedir a biometria.', expect.any(Error));
    });
  });

  describe('While the app is in the background', () => {
    beforeEach(() => {
      appState = mockAppState('background');
    });

    // O pedido que o sistema recebe com a atividade parada é descartado sem resposta: a promessa nunca resolve e o
    // botão giraria para sempre.
    it('Should wait for the app to become active before asking, and ask only once', async () => {
      jest.mocked(authenticateAsync).mockResolvedValue({ success: false, error: 'user_cancel' });

      await render(<AppLockedScreen />);
      expect(authenticateAsync).not.toHaveBeenCalled();

      await act(async () => appState.change('active'));
      expect(authenticateAsync).toHaveBeenCalledTimes(1);

      await act(async () => appState.change('background'));
      await act(async () => appState.change('active'));
      expect(authenticateAsync).toHaveBeenCalledTimes(1);
    });

    it('Should not ask when the app becomes active after the lock screen left', async () => {
      await render(<AppLockedScreen />);

      await screen.unmount();
      await act(async () => appState.change('active'));

      expect(authenticateAsync).not.toHaveBeenCalled();
    });
  });
});
