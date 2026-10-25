import type { User } from '@react-native-firebase/auth';
import { onSnapshot } from '@react-native-firebase/firestore';
import { act, renderHook } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useAccess } from './useAccess';

jest.mock('@react-native-firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  doc: jest.fn((_db: unknown, ...segments: string[]) => ({ path: segments.join('/') })),
}));
jest.mock('@/shared/services/firebase/firestoreDb', () => ({ firestoreDb: {} }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));

let deliver: (snapshot: unknown) => void;
let fail: (error: Error) => void;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useAuthState).mockReturnValue({ status: 'signedIn', user: { email: 'bruno.souza@exemplo.com' } as User });
  (onSnapshot as jest.Mock).mockImplementation(
    (_ref, _options, onNext: (snapshot: unknown) => void, onError: (error: Error) => void) => {
      // Como o SDK: depois de cancelada, uma escuta não entrega mais nada.
      let isClosed = false;
      deliver = (snapshot) => {
        if (!isClosed) onNext(snapshot);
      };
      fail = onError;
      return jest.fn(() => {
        isClosed = true;
      });
    },
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAccess', () => {
  it('Should open the app when the listener recovers after an error', async () => {
    const { result } = await renderHook(() => useAccess());
    // Um deploy de regras que nega por um instante: a leitura da lista falha.
    await act(async () => fail(Object.assign(new Error('permission-denied'), { code: 'firestore/permission-denied' })));
    expect(result.current.status).toBe('denied');

    await act(async () => jest.advanceTimersByTime(2000));
    await act(async () =>
      deliver({
        id: 'bruno.souza@exemplo.com',
        exists: () => true,
        data: () => ({ name: 'Bruno Souza', isAdmin: false }),
        metadata: { fromCache: false },
      }),
    );

    expect(result.current.status).toBe('allowed');
  });
});
