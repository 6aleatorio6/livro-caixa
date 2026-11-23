import { cancelAllScheduledNotificationsAsync } from 'expo-notifications';

import { signOutService } from '@/shared/services/auth/signOutService';
import { signOutScenarios } from '@/shared/services/auth/signOutService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { removeThisDevicePushToken } from '@/shared/utils/notifications/removeThisDevicePushToken';

import { doSignOut } from './doSignOut';

// Mocks com fábrica: o React Native Firebase não roda no Jest.
jest.mock('@/shared/utils/notifications/removeThisDevicePushToken', () => ({ removeThisDevicePushToken: jest.fn() }));
jest.mock('@/shared/services/auth/signOutService', () => ({ signOutService: jest.fn() }));
jest.mock('expo-notifications', () => ({ cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()) }));

beforeEach(() => {
  jest.clearAllMocks();
  mockServiceScenario(signOutService, signOutScenarios.memberSignsOut);
});

describe('doSignOut', () => {
  it('Should delete the token of this phone before signing out, while the rules still see the session', async () => {
    await doSignOut();

    expect(removeThisDevicePushToken).toHaveBeenCalledTimes(1);
    expect(signOutService).toHaveBeenCalledTimes(1);
    expect(jest.mocked(removeThisDevicePushToken).mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(signOutService).mock.invocationCallOrder[0],
    );
  });

  it('Should cancel the scheduled bill reminders, so who signed out sees no more of the family bills', async () => {
    await doSignOut();

    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('Should sign out even when cancelling the reminders fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failure = new Error('cancel failed');
    jest.mocked(cancelAllScheduledNotificationsAsync).mockRejectedValueOnce(failure);

    const { error } = await doSignOut();

    expect(error).toBeNull();
    expect(signOutService).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Não deu para cancelar os lembretes deste celular.', failure);
    warn.mockRestore();
  });
});
