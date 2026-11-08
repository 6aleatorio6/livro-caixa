import { create } from 'zustand';

import type { IAppVersionLockState } from '@/shared/types/version/AppVersionLockState';

/** A trava de versão: o que a última conferência decidiu. Muda só por `checkAppVersion`. */
export const useAppVersionLockStore = create<IAppVersionLockState>(() => ({
  requiredVersion: null,
}));
