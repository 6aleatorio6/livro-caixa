import { cancelAllScheduledNotificationsAsync } from 'expo-notifications';

import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { signOutService } from '@/shared/services/auth/signOutService';
import { removeThisDevicePushToken } from '@/shared/utils/notifications/removeThisDevicePushToken';

// O token sai antes do `signOutService`: depois dele não há sessão, e as regras recusam apagar. Os lembretes
// agendados saem também, para quem saiu não ver mais as contas da família neste celular.
export const doSignOut = createAsyncAction({
  run: async () => {
    await removeThisDevicePushToken();
    await cancelAllScheduledNotificationsAsync().catch((error: unknown) =>
      console.warn('Não deu para cancelar os lembretes deste celular.', error),
    );
    await signOutService();
  },
});
