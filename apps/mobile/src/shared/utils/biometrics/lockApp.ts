import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

/** Bloqueia o app até a biometria. Quem chama confere antes se a opção está ligada (`shouldLockOnReturn`). */
export function lockApp() {
  useBiometricLockStore.setState({ isLocked: true });
}
