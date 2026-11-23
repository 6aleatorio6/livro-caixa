import { renderHook } from '@testing-library/react-native';
import {
  clearLastNotificationResponse,
  useLastNotificationResponse,
  type NotificationResponse,
} from 'expo-notifications';
import { router, useSegments } from 'expo-router';

import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';

import { useOpenTappedNotification } from './useOpenTappedNotification';

// Mocks com fábrica: o módulo nativo das notificações e o roteador não rodam no Jest.
jest.mock('expo-notifications', () => ({
  useLastNotificationResponse: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useSegments: jest.fn() }));

function tapOn(data: Record<string, unknown>) {
  return { notification: { request: { content: { data } } } } as unknown as NotificationResponse;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useSegments).mockReturnValue(['(tabs)'] as never);
});

describe('useOpenTappedNotification', () => {
  it('Should open the url of the tapped notification once the access is allowed, and forget the tap', async () => {
    jest.mocked(useLastNotificationResponse).mockReturnValue(tapOn({ url: '/entries/2026-11_water' }));

    await renderHook(() => useOpenTappedNotification('allowed'));

    expect(router.push).toHaveBeenCalledWith('/entries/2026-11_water');
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it('Should wait while the access loads and open the url when it is allowed', async () => {
    jest.mocked(useLastNotificationResponse).mockReturnValue(tapOn({ url: '/entries/2026-11_water' }));
    const { rerender } = await renderHook(
      ({ status }: { status: IAccessStatus }) => useOpenTappedNotification(status),
      {
        initialProps: { status: 'loading' },
      },
    );

    expect(router.push).not.toHaveBeenCalled();
    expect(clearLastNotificationResponse).not.toHaveBeenCalled();

    await rerender({ status: 'allowed' });

    expect(router.push).toHaveBeenCalledWith('/entries/2026-11_water');
    expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it('Should wait for the screens of the app to replace the sign-in before opening the url', async () => {
    // Com o app fechado, o acesso vira liberado com a entrada ainda na frente; a troca das guardas abre o Início
    // logo depois e descartaria a tela aberta antes dela.
    jest.mocked(useLastNotificationResponse).mockReturnValue(tapOn({ url: '/entries/2026-11_water' }));
    jest.mocked(useSegments).mockReturnValue(['sign-in'] as never);
    const { rerender } = await renderHook(() => useOpenTappedNotification('allowed'));

    expect(router.push).not.toHaveBeenCalled();
    expect(clearLastNotificationResponse).not.toHaveBeenCalled();

    jest.mocked(useSegments).mockReturnValue(['(tabs)'] as never);
    await rerender({});

    expect(router.push).toHaveBeenCalledWith('/entries/2026-11_water');
  });

  it.each(['signedOut', 'denied'] as const)('Should not open the url while the person is %s', async (status) => {
    jest.mocked(useLastNotificationResponse).mockReturnValue(tapOn({ url: '/entries/2026-11_water' }));

    await renderHook(() => useOpenTappedNotification(status));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('Should ignore a notification without url, like the silent message that cancels a reminder', async () => {
    jest.mocked(useLastNotificationResponse).mockReturnValue(tapOn({ cancelReminder: '2026-11_water' }));

    await renderHook(() => useOpenTappedNotification('allowed'));

    expect(router.push).not.toHaveBeenCalled();
    expect(clearLastNotificationResponse).not.toHaveBeenCalled();
  });

  it('Should do nothing when no notification was tapped', async () => {
    jest.mocked(useLastNotificationResponse).mockReturnValue(null);

    await renderHook(() => useOpenTappedNotification('allowed'));

    expect(router.push).not.toHaveBeenCalled();
  });
});
