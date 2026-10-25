import { createTagService } from '@/shared/services/tag/create/createTagService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doCreateTag = createAsyncAction({ run: createTagService, successMessage: 'Tag criada' });
