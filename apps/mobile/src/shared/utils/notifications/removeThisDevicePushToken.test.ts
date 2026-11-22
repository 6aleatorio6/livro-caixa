import { getExpoPushTokenAsync, getPermissionsAsync } from 'expo-notifications';

import { deletePushTokenService } from '@/shared/services/pushToken/remove/deletePushTokenService';
import { deletePushTokenScenarios } from '@/shared/services/pushToken/remove/deletePushTokenService.scenarios';
import { usePushTokenStore } from '@/shared/store/pushToken.store';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { removeThisDevicePushToken } from './removeThisDevicePushToken';

// Mocks com fábrica: o React Native Firebase e o módulo nativo das notificações não rodam no Jest.
jest.mock('@/shared/services/pushToken/remove/deletePushTokenService', () => ({ deletePushTokenService: jest.fn() }));
jest.mock('expo-notifications', () => ({ getPermissionsAsync: jest.fn(), getExpoPushTokenAsync: jest.fn() }));

const scenario = deletePushTokenScenarios.memberDeletesTheTokenOfThePhone;
const [token] = scenario.input;

function givenPermission(status: 'granted' | 'denied') {
  jest.mocked(getPermissionsAsync).mockResolvedValue({ status } as Awaited<ReturnType<typeof getPermissionsAsync>>);
}

beforeEach(() => {
  jest.clearAllMocks();
  usePushTokenStore.setState({ token });
  mockServiceScenario(deletePushTokenService, scenario);
  jest.mocked(getExpoPushTokenAsync).mockResolvedValue({ type: 'expo', data: token });
});

describe('removeThisDevicePushToken', () => {
  it('Should delete the remembered token and forget it, without asking Expo again', async () => {
    await removeThisDevicePushToken();

    expect(deletePushTokenService).toHaveBeenCalledWith(...scenario.input);
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(usePushTokenStore.getState().token).toBeNull();
  });

  it('Should ask Expo for the token when this opening of the app could not remember one', async () => {
    usePushTokenStore.setState({ token: null });
    givenPermission('granted');

    await removeThisDevicePushToken();

    expect(deletePushTokenService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should delete nothing when there is no remembered token and no permission', async () => {
    usePushTokenStore.setState({ token: null });
    givenPermission('denied');

    await removeThisDevicePushToken();

    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(deletePushTokenService).not.toHaveBeenCalled();
  });

  it('Should give up after 3 seconds when the delete does not finish, so the person signs out offline', async () => {
    jest.useFakeTimers();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.mocked(deletePushTokenService).mockReturnValue(new Promise(() => undefined));

    const removal = removeThisDevicePushToken();
    await jest.advanceTimersByTimeAsync(3000);

    await expect(removal).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith('Não deu para apagar o token de notificação deste celular.', expect.any(Error));
    warn.mockRestore();
    jest.useRealTimers();
  });

  it('Should log and give up after 3 seconds when asking Expo for the token does not finish', async () => {
    jest.useFakeTimers();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    usePushTokenStore.setState({ token: null });
    givenPermission('granted');
    jest.mocked(getExpoPushTokenAsync).mockReturnValue(new Promise(() => undefined));

    const removal = removeThisDevicePushToken();
    await jest.advanceTimersByTimeAsync(3000);

    await expect(removal).resolves.toBeUndefined();
    expect(deletePushTokenService).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('Não deu para apagar o token de notificação deste celular.', expect.any(Error));
    warn.mockRestore();
    jest.useRealTimers();
  });

  it('Should only log when deleting the token fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failure = new Error('permission-denied');
    jest.mocked(deletePushTokenService).mockRejectedValue(failure);

    await expect(removeThisDevicePushToken()).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Não deu para apagar o token de notificação deste celular.', failure);
    warn.mockRestore();
  });
});
