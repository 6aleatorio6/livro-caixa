import { updateTagService } from '@/shared/services/tag/update/updateTagService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doUpdateTag = createAsyncAction({ run: updateTagService, successMessage: 'Tag salva' });
