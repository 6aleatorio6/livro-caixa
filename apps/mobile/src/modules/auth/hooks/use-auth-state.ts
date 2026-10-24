import { onAuthStateChanged } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';

import { firebaseAuth } from '@/shared/services/firebase/firebase-auth';

import type { IAuthState } from '../types/auth-state';

/** A sessão do Firebase Auth, em tempo real. */
export function useAuthState(): IAuthState {
  const [authState, setAuthState] = useState<IAuthState>({ status: 'loading' });

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (user) =>
        setAuthState(user ? { status: 'signedIn', user } : { status: 'signedOut' }),
      ),
    [],
  );

  return authState;
}
