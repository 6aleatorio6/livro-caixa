import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { setBiometricsEnabled } from './setBiometricsEnabled';
import { writeBiometricsEnabled } from './writeBiometricsEnabled';

jest.mock('./writeBiometricsEnabled', () => ({ writeBiometricsEnabled: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  useBiometricLockStore.setState(useBiometricLockStore.getInitialState());
});

describe('Biometric lock store', () => {
  describe('setBiometricsEnabled', () => {
    it('Should turn the option on in the store and in the file', () => {
      setBiometricsEnabled(true);

      expect(useBiometricLockStore.getState().isEnabled).toBe(true);
      expect(writeBiometricsEnabled).toHaveBeenCalledWith(true);
    });

    it('Should turn the option off in the store and in the file', () => {
      setBiometricsEnabled(true);
      setBiometricsEnabled(false);

      expect(useBiometricLockStore.getState().isEnabled).toBe(false);
      expect(writeBiometricsEnabled).toHaveBeenLastCalledWith(false);
    });

    it('Should keep the store as it was when the file cannot be written', () => {
      jest.mocked(writeBiometricsEnabled).mockImplementationOnce(() => {
        throw new Error('Sem espaço no celular');
      });

      expect(() => setBiometricsEnabled(true)).toThrow('Sem espaço no celular');
      expect(useBiometricLockStore.getState().isEnabled).toBe(false);
    });
  });
});
