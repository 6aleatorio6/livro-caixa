import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

/** Libera o app depois que a biometria (ou o PIN do aparelho) confirmou a pessoa. */
export function unlockApp() {
  useBiometricLockStore.setState({ isLocked: false });
}
