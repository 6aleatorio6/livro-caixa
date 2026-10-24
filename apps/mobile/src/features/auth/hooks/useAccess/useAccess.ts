import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';
import { accessStatusFor } from '@/features/auth/utils/accessStatusFor';
import { allowedEmailId } from '@/features/auth/utils/allowedEmailId';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

/** Em que tela a pessoa cai: login, sem acesso ou o app. */
export function useAccess(): IAccessStatus {
  const authState = useAuthState();
  const email = authState.status === 'signedIn' ? authState.user.email : null;
  const allowedEmail = useRealtime(allowedEmailQueryService, { emailId: email ? allowedEmailId(email) : null });
  return accessStatusFor(authState, allowedEmail);
}
