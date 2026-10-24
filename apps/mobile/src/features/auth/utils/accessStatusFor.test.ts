import type { User } from '@react-native-firebase/auth';

import type { IRealtimeState } from '@/shared/types/realtime/RealtimeState';

import type { IAllowedEmail } from '@/shared/types/allowedEmail/AllowedEmail';
import type { IAuthState } from '@/shared/types/auth/AuthState';

import { accessStatusFor } from './accessStatusFor';

const signedIn: IAuthState = { status: 'signedIn', user: { email: 'ana@gmail.com' } as User };

const PERSON: IAllowedEmail = { name: 'Bruno Souza', isAdmin: false };

function allowedEmail(
  status: IRealtimeState<IAllowedEmail | null>['status'],
  person: IAllowedEmail | null,
): IRealtimeState<IAllowedEmail | null> {
  return { status, data: person };
}

describe('accessStatusFor', () => {
  it('Should wait while the session is still loading', () => {
    expect(accessStatusFor({ status: 'loading' }, allowedEmail('idle', null))).toBe('loading');
  });

  it('Should send a signed-out person to sign-in', () => {
    expect(accessStatusFor({ status: 'signedOut' }, allowedEmail('idle', null))).toBe('signedOut');
  });

  it('Should wait while the allowed list is still being read', () => {
    expect(accessStatusFor(signedIn, allowedEmail('loading', null))).toBe('loading');
  });

  it('Should let an e-mail on the allowed list in', () => {
    expect(accessStatusFor(signedIn, allowedEmail('success', PERSON))).toBe('allowed');
  });

  it('Should stop an e-mail outside the allowed list', () => {
    expect(accessStatusFor(signedIn, allowedEmail('success', null))).toBe('denied');
  });

  it('Should let in from the device cache, offline, an e-mail the cache knows', () => {
    expect(accessStatusFor(signedIn, allowedEmail('cached', PERSON))).toBe('allowed');
  });

  it('Should wait for the server instead of denying when only the cache says the e-mail is missing', () => {
    expect(accessStatusFor(signedIn, allowedEmail('cached', null))).toBe('loading');
  });

  it('Should show the no-access screen when the list cannot be read', () => {
    expect(accessStatusFor(signedIn, allowedEmail('error', null))).toBe('denied');
  });
});
