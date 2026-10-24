import { createAsyncAction } from '@/shared/actions/create-async-action';

import { signInWithGoogleService } from '../../../services/sign-in-with-google.service';

export const doSignInWithGoogle = createAsyncAction({ run: signInWithGoogleService });
