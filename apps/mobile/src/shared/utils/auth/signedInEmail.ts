import type { IAuthState } from '@/shared/types/auth/AuthState';

/** O e-mail de quem entrou; `null` sem sessão. */
export function signedInEmail(authState: IAuthState) {
  return authState.status === 'signedIn' ? authState.user.email : null;
}
