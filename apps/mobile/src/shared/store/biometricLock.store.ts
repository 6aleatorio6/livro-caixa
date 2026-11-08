import { create } from 'zustand';

import type { IBiometricLockState } from '@/shared/types/biometrics/BiometricLockState';

/**
 * O bloqueio pela biometria. Muda por `setBiometricsEnabled` (a opção), `lockApp` e `unlockApp` (o bloqueio) e pelo
 * `useBiometricLock`, que na abertura a frio traz a opção do arquivo; ela começa desligada.
 */
export const useBiometricLockStore = create<IBiometricLockState>(() => ({
  isEnabled: false,
  isLocked: false,
}));
