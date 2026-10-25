import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doDeletePayment = createAsyncAction({
  run: deleteEntryService,
  shouldShowLoader: true,
  successMessage: 'Pagamento excluído.',
});
