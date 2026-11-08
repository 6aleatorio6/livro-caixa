import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { shareReceipt } from '../shareReceipt';

export const doShareReceipt = createAsyncAction({ run: shareReceipt });
