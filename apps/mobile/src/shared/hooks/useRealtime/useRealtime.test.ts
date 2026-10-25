import { onSnapshot } from '@react-native-firebase/firestore';
import { act, renderHook } from '@testing-library/react-native';

import { useToastStore } from '@/core/store/toast.store';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';
import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import { useRealtime } from './useRealtime';

jest.mock('@react-native-firebase/firestore', () => ({ onSnapshot: jest.fn() }));

let deliver: (snapshot: unknown) => void;
let fail: (error: Error) => void;

beforeEach(() => {
  jest.clearAllMocks();
  useToastStore.setState({ toast: null });
  (onSnapshot as jest.Mock).mockImplementation(
    (_ref, _options, onNext: (snapshot: unknown) => void, onError: (error: Error) => void) => {
      // Como o SDK: depois de cancelada, uma escuta não entrega mais nada.
      let isClosed = false;
      deliver = (snapshot) => {
        if (!isClosed) onNext(snapshot);
      };
      fail = onError;
      const unsubscribe = jest.fn(() => {
        isClosed = true;
      });
      return unsubscribe;
    },
  );
});

afterEach(() => {
  jest.useRealTimers();
});

const PERMISSION_DENIED = Object.assign(new Error('permission-denied'), { code: 'firestore/permission-denied' });

function allowedSnapshot() {
  return { id: 'ana@gmail.com', exists: () => true, data: () => ({}), metadata: { fromCache: false } };
}

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

  describe('When a listener fails', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('Should listen again after a listener error', async () => {
      await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
      expect(onSnapshot).toHaveBeenCalledTimes(1);

      await act(async () => fail(PERMISSION_DENIED));
      expect(onSnapshot).toHaveBeenCalledTimes(1);
      await act(async () => jest.advanceTimersByTime(2000));

      expect(onSnapshot).toHaveBeenCalledTimes(2);
    });

    it('Should keep the error status while it waits to listen again', async () => {
      const { result } = await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));

      await act(async () => fail(PERMISSION_DENIED));
      expect(result.current).toEqual({ status: 'error', data: null });
      await act(async () => jest.advanceTimersByTime(2000));

      expect(result.current).toEqual({ status: 'error', data: null });
    });

    it('Should go back to the data when the new listener delivers', async () => {
      const { result } = await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
      await act(async () => fail(PERMISSION_DENIED));
      await act(async () => jest.advanceTimersByTime(2000));

      await act(async () => deliver(allowedSnapshot()));

      expect(result.current).toEqual({ status: 'success', data: true });
    });

    it('Should wait longer after each failure, up to 30 seconds', async () => {
      await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
      const delaysInSeconds = [2, 5, 15, 30, 30];

      for (const [index, seconds] of delaysInSeconds.entries()) {
        await act(async () => fail(PERMISSION_DENIED));
        await act(async () => jest.advanceTimersByTime(seconds * 1000 - 1));
        expect(onSnapshot).toHaveBeenCalledTimes(index + 1);
        await act(async () => jest.advanceTimersByTime(1));
        expect(onSnapshot).toHaveBeenCalledTimes(index + 2);
      }
    });

    it('Should start the delays over after the listener delivers', async () => {
      await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
      await act(async () => fail(PERMISSION_DENIED));
      await act(async () => jest.advanceTimersByTime(2000));
      await act(async () => fail(PERMISSION_DENIED));
      await act(async () => jest.advanceTimersByTime(5000));
      await act(async () => deliver(allowedSnapshot()));

      await act(async () => fail(PERMISSION_DENIED));
      await act(async () => jest.advanceTimersByTime(2000));

      expect(onSnapshot).toHaveBeenCalledTimes(4);
    });

    it('Should stop trying to listen again when the screen unmounts', async () => {
      const { unmount } = await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));
      await act(async () => fail(PERMISSION_DENIED));

      await unmount();
      await act(async () => jest.advanceTimersByTime(60000));

      expect(onSnapshot).toHaveBeenCalledTimes(1);
    });

    it('Should drop the pending retry when the params change', async () => {
      const { rerender, result } = await renderHook(
        ({ email }: { email: string }) => useRealtime(allowedEmailService, { email }),
        { initialProps: { email: 'ana@gmail.com' } },
      );
      await act(async () => fail(PERMISSION_DENIED));

      await rerender({ email: 'bruno@gmail.com' });
      expect(result.current.status).toBe('loading');
      expect(onSnapshot).toHaveBeenCalledTimes(2);
      await act(async () => jest.advanceTimersByTime(60000));

      expect(onSnapshot).toHaveBeenCalledTimes(2);
    });

    it('Should not show a toast when a listener fails', async () => {
      await renderHook(() => useRealtime(allowedEmailService, { email: 'ana@gmail.com' }));

      await act(async () => fail(PERMISSION_DENIED));

      expect(useToastStore.getState().toast).toBeNull();
    });
  });
});
