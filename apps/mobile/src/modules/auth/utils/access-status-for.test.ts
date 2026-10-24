import type { User } from '@react-native-firebase/auth';

import type { IRealtimeState } from '@/shared/services/realtime/realtime-state';

import type { IAuthState } from '../types/auth-state';

import { accessStatusFor } from './access-status-for';

const signedIn: IAuthState = { status: 'signedIn', user: { email: 'ana@gmail.com' } as User };

function allowedEmail(status: IRealtimeState<boolean>['status'], isAllowed: boolean | null): IRealtimeState<boolean> {
  return { status, data: isAllowed };
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
    expect(accessStatusFor(signedIn, allowedEmail('success', true))).toBe('allowed');
  });

  it('Should stop an e-mail outside the allowed list', () => {
    expect(accessStatusFor(signedIn, allowedEmail('success', false))).toBe('denied');
  });

  it('Should let in from the device cache, offline, an e-mail the cache knows', () => {
    expect(accessStatusFor(signedIn, allowedEmail('cached', true))).toBe('allowed');
  });

  it('Should wait for the server instead of denying when only the cache says the e-mail is missing', () => {
    expect(accessStatusFor(signedIn, allowedEmail('cached', false))).toBe('loading');
  });

  it('Should show the no-access screen when the list cannot be read', () => {
    expect(accessStatusFor(signedIn, allowedEmail('error', null))).toBe('denied');
  });
});
