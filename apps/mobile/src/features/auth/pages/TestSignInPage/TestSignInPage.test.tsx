import { render } from '@testing-library/react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';

import { TestSignInPage } from './TestSignInPage';

let mockEmulatorHost: string | null = '10.0.2.2';

jest.mock('expo-router', () => ({ Redirect: jest.fn(() => null), useLocalSearchParams: jest.fn() }));
jest.mock('@/shared/services/firebase/emulatorHost', () => ({
  get EMULATOR_HOST() {
    return mockEmulatorHost;
  },
}));
jest.mock('@/shared/services/auth/signInWithFakeGoogleService', () => ({
  signInWithFakeGoogleService: jest.fn(async () => null),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (useLocalSearchParams as jest.Mock).mockReturnValue({ email: 'bruno.souza@exemplo.com', name: 'Bruno Souza' });
});

describe('TestSignInPage', () => {
  it('Should sign in with the e-mail and the name from the link when the app talks to the emulators', async () => {
    mockEmulatorHost = '10.0.2.2';

    await render(<TestSignInPage />);

    expect(signInWithFakeGoogleService).toHaveBeenCalledWith({ email: 'bruno.souza@exemplo.com', name: 'Bruno Souza' });
    expect(Redirect).not.toHaveBeenCalled();
  });

  it('Should go back to sign-in without signing in when the app talks to the real project', async () => {
    mockEmulatorHost = null;

    await render(<TestSignInPage />);

    expect(signInWithFakeGoogleService).not.toHaveBeenCalled();
    expect((Redirect as jest.Mock).mock.calls[0][0]).toEqual({ href: '/sign-in' });
  });

  it('Should go back to sign-in without signing in when the link has no e-mail', async () => {
    mockEmulatorHost = '10.0.2.2';
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    await render(<TestSignInPage />);

    expect(signInWithFakeGoogleService).not.toHaveBeenCalled();
    expect((Redirect as jest.Mock).mock.calls[0][0]).toEqual({ href: '/sign-in' });
  });

  it('Should use the e-mail as the name when the link has no name', async () => {
    mockEmulatorHost = '10.0.2.2';
    (useLocalSearchParams as jest.Mock).mockReturnValue({ email: 'bruno.souza@exemplo.com' });

    await render(<TestSignInPage />);

    expect(signInWithFakeGoogleService).toHaveBeenCalledWith({
      email: 'bruno.souza@exemplo.com',
      name: 'bruno.souza@exemplo.com',
    });
  });
});
