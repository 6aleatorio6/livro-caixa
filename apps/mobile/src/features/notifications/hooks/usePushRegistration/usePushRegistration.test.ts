import { act, renderHook } from '@testing-library/react-native';
import {
  addPushTokenListener,
  type DevicePushToken,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { AppState, type AppStateStatus } from 'react-native';

import { usePushTokenStore } from '@/shared/store/pushToken.store';
import { savePushTokenService } from '@/shared/services/pushToken/save/savePushTokenService';
import { savePushTokenScenarios } from '@/shared/services/pushToken/save/savePushTokenService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { usePushRegistration } from './usePushRegistration';

// Mocks com fábrica: o módulo nativo e o React Native Firebase não rodam no Jest.
jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(),
}));
jest.mock('@/shared/services/pushToken/save/savePushTokenService', () => ({ savePushTokenService: jest.fn() }));

const scenario = savePushTokenScenarios.memberSavesTheTokenOfThePhone;

beforeEach(() => {
  jest.clearAllMocks();
  usePushTokenStore.setState({ token: null });
  jest.mocked(setNotificationChannelAsync).mockResolvedValue(null);
  jest.mocked(getExpoPushTokenAsync).mockResolvedValue({ type: 'expo', data: scenario.input[0] });
  mockServiceScenario(savePushTokenService, scenario);
});

function givenPermission(status: 'undetermined' | 'granted' | 'denied') {
  jest.mocked(getPermissionsAsync).mockResolvedValue({ status } as never);
}

/** Deixa a cadeia de promessas do cadastro correr até o fim: o hook não devolve nada a esperar. */
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/** O `AppState` do Jest não muda sozinho: o teste guarda os ouvintes e os chama, como o Android ao devolver o app. */
let appStateListeners: ((state: AppStateStatus) => void)[] = [];

beforeEach(() => {
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListeners.push(listener);
    return { remove: () => (appStateListeners = appStateListeners.filter((other) => other !== listener)) };
  });
});

/** Os ouvintes da troca do token, que o teste chama como o `expo-notifications` quando o FCM avisa. */
let tokenListeners: ((token: DevicePushToken) => void)[] = [];

beforeEach(() => {
  tokenListeners = [];
  jest.mocked(addPushTokenListener).mockImplementation((listener) => {
    tokenListeners.push(listener);
    return { remove: () => (tokenListeners = tokenListeners.filter((other) => other !== listener)) };
  });
});

async function receiveDeviceToken(data: string) {
  tokenListeners.forEach((listener) => listener({ type: 'android', data }));
  await settle();
}

async function comeBackToForeground() {
  appStateListeners.forEach((listener) => listener('active'));
  await settle();
}

describe('usePushRegistration', () => {
  it('Should ask for the permission once and save the token when the person grants it', async () => {
    givenPermission('undetermined');
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(savePushTokenService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should save the token without asking again when the permission was already granted', async () => {
    givenPermission('granted');

    await renderHook(() => usePushRegistration());

    await settle();
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    expect(savePushTokenService).toHaveBeenCalledWith(...scenario.input);
  });

  // No Android 13+, a permissão nunca pedida chega como `denied`: é a primeira abertura de quem acabou de instalar.
  it('Should ask for the permission and save the token when the first read says denied', async () => {
    givenPermission('denied');
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(savePushTokenService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should neither get nor save the token when the permission stays denied', async () => {
    givenPermission('denied');
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(savePushTokenService).not.toHaveBeenCalled();
  });

  it('Should save nothing when the person refuses the permission asked now', async () => {
    givenPermission('undetermined');
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(savePushTokenService).not.toHaveBeenCalled();
  });

  it('Should create both channels before it asks for the permission and gets the token', async () => {
    givenPermission('undetermined');
    jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(setNotificationChannelAsync).toHaveBeenCalledWith('entries', { name: 'Lançamentos', importance: 5 });
    expect(setNotificationChannelAsync).toHaveBeenCalledWith('billReminders', { name: 'Vencimentos', importance: 5 });
    const lastChannel = Math.max(...jest.mocked(setNotificationChannelAsync).mock.invocationCallOrder);
    expect(lastChannel).toBeLessThan(jest.mocked(getPermissionsAsync).mock.invocationCallOrder[0]);
    expect(lastChannel).toBeLessThan(jest.mocked(getExpoPushTokenAsync).mock.invocationCallOrder[0]);
  });

  describe('when the app comes back to the foreground', () => {
    it('Should save the token without asking when the person turned the permission on in the Android settings', async () => {
      givenPermission('denied');
      jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      await renderHook(() => usePushRegistration());
      await settle();

      givenPermission('granted');
      await comeBackToForeground();

      expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(savePushTokenService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should not ask again when the permission is still denied', async () => {
      givenPermission('denied');
      jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      await renderHook(() => usePushRegistration());
      await settle();

      await comeBackToForeground();

      expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('Should not save again when the phone already has its token', async () => {
      givenPermission('granted');
      await renderHook(() => usePushRegistration());
      await settle();

      await comeBackToForeground();

      expect(savePushTokenService).toHaveBeenCalledTimes(1);
    });

    // O diálogo da permissão tira o app da frente: fechá-lo devolve o app antes de o pedido responder.
    it('Should save once when the app comes back while the permission request is still open', async () => {
      givenPermission('denied');
      let grant = (_: unknown) => undefined as void;
      jest.mocked(requestPermissionsAsync).mockReturnValue(new Promise((resolve) => (grant = resolve)) as never);
      await renderHook(() => usePushRegistration());
      await settle();

      givenPermission('granted');
      await comeBackToForeground();
      grant({ status: 'granted' });
      await settle();

      expect(savePushTokenService).toHaveBeenCalledTimes(1);
    });

    it('Should stop listening when the tabs unmount', async () => {
      givenPermission('denied');
      jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      const { unmount } = await renderHook(() => usePushRegistration());
      await settle();
      await act(async () => unmount());

      givenPermission('granted');
      await comeBackToForeground();

      expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    });
  });

  describe('when the push service sends a device token', () => {
    const rolledToken = 'ExponentPushToken[rolled-by-fcm]';

    it('Should save the new token when FCM rolled it with the app open', async () => {
      givenPermission('granted');
      await renderHook(() => usePushRegistration());
      await settle();

      jest.mocked(getExpoPushTokenAsync).mockResolvedValue({ type: 'expo', data: rolledToken });
      await receiveDeviceToken('new-fcm-token');

      expect(getExpoPushTokenAsync).toHaveBeenLastCalledWith({
        devicePushToken: { type: 'android', data: 'new-fcm-token' },
      });
      expect(savePushTokenService).toHaveBeenLastCalledWith(rolledToken);
      expect(usePushTokenStore.getState().token).toBe(rolledToken);
    });

    // O próprio `getExpoPushTokenAsync` do cadastro avisa os ouvintes com o mesmo token.
    it('Should not save again when the token did not change', async () => {
      givenPermission('granted');
      await renderHook(() => usePushRegistration());
      await settle();

      await receiveDeviceToken('same-fcm-token');

      expect(savePushTokenService).toHaveBeenCalledTimes(1);
    });

    it('Should save nothing when the phone is not registered', async () => {
      givenPermission('denied');
      jest.mocked(requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
      await renderHook(() => usePushRegistration());
      await settle();

      await receiveDeviceToken('new-fcm-token');

      expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(savePushTokenService).not.toHaveBeenCalled();
    });
  });

  it('Should only log when saving the token fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    givenPermission('granted');
    const failure = new Error('permission-denied');
    jest.mocked(savePushTokenService).mockRejectedValue(failure);

    await renderHook(() => usePushRegistration());

    await settle();
    expect(warn).toHaveBeenCalledWith('Não deu para cadastrar este celular para as notificações.', failure);
    // Fica guardado: se a gravação chegou ao servidor sem a resposta voltar, a saída ainda apaga o documento.
    expect(usePushTokenStore.getState().token).toBe(scenario.input[0]);
    warn.mockRestore();
  });
});
