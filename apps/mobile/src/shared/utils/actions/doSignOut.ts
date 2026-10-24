import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { signOutService } from '@/shared/services/auth/signOutService';

export const doSignOut = createAsyncAction({ run: signOutService });
