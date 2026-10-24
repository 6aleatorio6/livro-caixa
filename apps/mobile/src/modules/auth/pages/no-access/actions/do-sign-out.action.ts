import { createAsyncAction } from '@/shared/actions/create-async-action';

import { signOutService } from '../../../services/sign-out.service';

export const doSignOut = createAsyncAction({ run: signOutService });
