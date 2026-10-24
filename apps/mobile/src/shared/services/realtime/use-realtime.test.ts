import { onSnapshot } from '@react-native-firebase/firestore';
import { act, renderHook } from '@testing-library/react-native';

import { createRealtimeService } from './create-realtime-service';
import type { IRealtimeRef } from './realtime-ref';
import { useRealtime } from './use-realtime';

jest.mock('@react-native-firebase/firestore', () => ({ onSnapshot: jest.fn() }));

let deliver: (snapshot: unknown) => void;

beforeEach(() => {
  jest.clearAllMocks();
  (onSnapshot as jest.Mock).mockImplementation((_ref, _options, onNext: (snapshot: unknown) => void) => {
    deliver = onNext;
    return jest.fn();
  });
});

const allowedEmailService = createRealtimeService({
  refs: ({ email }: { email: string | null }) =>
    email ? [{ path: `allowedEmails/${email}` } as unknown as IRealtimeRef] : [],
  resolve: ([allowedEmail]) => allowedEmail !== null,
});

describe('useRealtime', () => {
  it('Should stay idle while the service has no refs to listen to', async () => {
    const { result } = await renderHook(() => useRealtime(allowedEmailService, { email: null }));

    expect(result.current.status).toBe('idle');
  });

  it('Should go from loading to success with the resolved data', async () => {
    const { result } = await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
    expect(result.current.status).toBe('loading');

    await act(async () =>
      deliver({ id: 'ana@gmail.com', exists: () => true, data: () => ({}), metadata: { fromCache: false } }),
    );

    expect(result.current).toEqual({ status: 'success', data: true });
  });
});
