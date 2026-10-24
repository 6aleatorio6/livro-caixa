import type { IRealtimeState } from '@/shared/types/realtime/RealtimeState';

import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';
import type { IAuthState } from '@/shared/types/auth/AuthState';

/**
 * A tela de acesso que vale para a sessão e para a leitura do e-mail na lista. Uma recusa só vem do
 * servidor: sem internet e sem o e-mail no cache do aparelho, o app espera em vez de dizer que a
 * pessoa não tem acesso.
 */
export function accessStatusFor(authState: IAuthState, allowedEmail: IRealtimeState<boolean>): IAccessStatus {
  if (authState.status !== 'signedIn') return authState.status;
  switch (allowedEmail.status) {
    case 'success':
      return allowedEmail.data ? 'allowed' : 'denied';
    case 'cached':
      return allowedEmail.data ? 'allowed' : 'loading';
    case 'error':
      return 'denied';
    default:
      return 'loading';
  }
}
