import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { signInWithGoogleService } from '@/shared/services/auth/signInWithGoogleService';

export const doSignInWithGoogle = createAsyncAction({ run: signInWithGoogleService });
