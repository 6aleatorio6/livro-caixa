import { act, renderHook } from '@testing-library/react-native';
import {
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications';

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
