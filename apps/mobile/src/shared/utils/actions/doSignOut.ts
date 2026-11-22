import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { signOutService } from '@/shared/services/auth/signOutService';
import { removeThisDevicePushToken } from '@/shared/utils/notifications/removeThisDevicePushToken';

// O token sai antes do `signOutService`: depois dele não há sessão, e as regras recusam apagar.
export const doSignOut = createAsyncAction({
  run: async () => {
    await removeThisDevicePushToken();
    await signOutService();
  },
});
