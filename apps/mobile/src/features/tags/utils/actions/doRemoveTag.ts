import { removeTagService } from '@/shared/services/tag/remove/removeTagService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doRemoveTag = createAsyncAction({ run: removeTagService, successMessage: 'Tag excluída' });
