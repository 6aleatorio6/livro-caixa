import type { IAuthState } from '@/shared/types/auth/AuthState';

/** O uid de quem entrou; `null` sem sessão. */
export function signedInUid(authState: IAuthState) {
  return authState.status === 'signedIn' ? authState.user.uid : null;
}
