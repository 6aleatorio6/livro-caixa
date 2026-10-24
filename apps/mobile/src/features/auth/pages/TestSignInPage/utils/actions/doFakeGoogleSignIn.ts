import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';

export const doFakeGoogleSignIn = createAsyncAction({ run: signInWithFakeGoogleService });
