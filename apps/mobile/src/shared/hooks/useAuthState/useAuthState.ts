import { onAuthStateChanged } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';

import type { IAuthState } from '@/shared/types/auth/AuthState';

/** A sessão do Firebase Auth, em tempo real. */
export function useAuthState(): IAuthState {
  // Com a sessão já restaurada, quem monta depois começa nela: a tela não mostra um instante sem o usuário.
  const [authState, setAuthState] = useState<IAuthState>(() =>
    firebaseAuth.currentUser ? { status: 'signedIn', user: firebaseAuth.currentUser } : { status: 'loading' },
  );

  useEffect(
    () =>
      onAuthStateChanged(firebaseAuth, (user) =>
        setAuthState(user ? { status: 'signedIn', user } : { status: 'signedOut' }),
      ),
    [],
  );

  return authState;
}
