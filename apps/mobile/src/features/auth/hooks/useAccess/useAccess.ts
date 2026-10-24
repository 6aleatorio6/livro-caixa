import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';
import { accessStatusFor } from '@/features/auth/utils/accessStatusFor';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

/** Em que tela a pessoa cai: login, sem acesso ou o app. */
export function useAccess(): IAccessStatus {
  const authState = useAuthState();
  const allowedEmail = useRealtime(allowedEmailQueryService, { email: signedInEmail(authState) });
  return accessStatusFor(authState, allowedEmail);
}
