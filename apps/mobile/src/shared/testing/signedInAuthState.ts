import type { User } from '@react-native-firebase/auth';

import type { IAuthState } from '@/shared/types/auth/AuthState';

/**
 * A sessão para o `useAuthState` mockado, com o usuário de um cenário de entrada. O cenário traz só
 * os campos que as telas leem, que o contrato do serviço de entrada confere no emulador do Auth.
 */
export function signedInAuthState(signIn: {
  result: Pick<User, 'uid' | 'email' | 'displayName' | 'emailVerified'>;
}): IAuthState {
  return { status: 'signedIn', user: signIn.result as User };
}
