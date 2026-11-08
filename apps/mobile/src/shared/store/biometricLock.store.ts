import { create } from 'zustand';

import type { IBiometricLockState } from '@/shared/types/biometrics/BiometricLockState';

/**
 * O bloqueio pela biometria. Muda só por `setBiometricsEnabled`, `lockApp`, `unlockApp` e `markBackgrounded`; a opção
 * começa desligada e quem abre o app a lê do arquivo.
 */
export const useBiometricLockStore = create<IBiometricLockState>(() => ({
  isEnabled: false,
  isLocked: false,
}));
