import { useRealtime } from '@/shared/services/realtime/use-realtime';

import { allowedEmailRealtime } from '../services/allowed-email.realtime';
import type { IAccessStatus } from '../types/access-status';
import { accessStatusFor } from '../utils/access-status-for';
import { allowedEmailId } from '../utils/allowed-email-id';

import { useAuthState } from './use-auth-state';

/** Em que tela a pessoa cai: login, sem acesso ou o app. */
export function useAccess(): IAccessStatus {
  const authState = useAuthState();
  const email = authState.status === 'signedIn' ? authState.user.email : null;
  const allowedEmail = useRealtime(allowedEmailRealtime, { emailId: email ? allowedEmailId(email) : null });
  return accessStatusFor(authState, allowedEmail);
}
