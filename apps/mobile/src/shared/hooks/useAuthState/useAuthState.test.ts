import { renderHook } from '@testing-library/react-native';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { useAuthState } from './useAuthState';

jest.mock('@react-native-firebase/auth', () => ({ onAuthStateChanged: jest.fn(() => jest.fn()) }));
jest.mock('@/shared/services/firebase/firebaseAuth', () => ({ firebaseAuth: { currentUser: null } }));

function restoreSession(user: object | null) {
  (firebaseAuth as { currentUser: unknown }).currentUser = user;
}

describe('useAuthState', () => {
  it('Should start on the session already restored, without passing through loading', async () => {
    const user = { email: 'ana.souza@gmail.com' };
    restoreSession(user);

    const { result } = await renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: 'signedIn', user });
  });

  it('Should stay loading while the session has not been restored', async () => {
    restoreSession(null);

    const { result } = await renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: 'loading' });
  });
});
