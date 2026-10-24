import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { signInWithFakeGoogleService } from './signInWithFakeGoogleService';

jest.mock('@react-native-firebase/auth', () => ({
  GoogleAuthProvider: { credential: jest.fn(() => 'credencial do emulador') },
  signInWithCredential: jest.fn(async () => ({ user: { uid: 'carla' } })),
}));
jest.mock('@/shared/services/firebase/firebaseAuth', () => ({ firebaseAuth: {} }));

describe('signInWithFakeGoogleService', () => {
  it('Should hand the emulator a verified Google identity keyed by the e-mail, with the name', async () => {
    await signInWithFakeGoogleService({ email: 'carla.lima@exemplo.com', name: 'Carla Lima' });

    const identity = JSON.parse((GoogleAuthProvider.credential as jest.Mock).mock.calls[0][0]);
    expect(identity).toEqual({
      sub: 'carla.lima@exemplo.com',
      email: 'carla.lima@exemplo.com',
      email_verified: true,
      name: 'Carla Lima',
    });
    expect(signInWithCredential).toHaveBeenCalledWith(firebaseAuth, 'credencial do emulador');
  });
});
