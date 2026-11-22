import { create } from 'zustand';

import type { IPushTokenState } from '@/shared/types/notifications/PushTokenState';

/**
 * O token de notificação que este celular grava no Firestore. O `usePushRegistration` o guarda logo antes de gravar,
 * e o `removeThisDevicePushToken` o lê para apagar ao sair, sem perguntar nada à rede; começa sem token.
 */
export const usePushTokenStore = create<IPushTokenState>(() => ({
  token: null,
}));
