import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';
import { accessStatusFor } from '@/features/auth/utils/accessStatusFor';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

/** Em que tela a pessoa cai (login, sem acesso ou o app) e se, dentro do app, ela é a admin. */
export function useAccess(): { status: IAccessStatus; isAdmin: boolean } {
  const authState = useAuthState();
  const allowedEmail = useRealtime(allowedEmailQueryService, { email: signedInEmail(authState) });
  const status = accessStatusFor(authState, allowedEmail);
  return { status, isAdmin: status === 'allowed' && allowedEmail.data?.isAdmin === true };
}
