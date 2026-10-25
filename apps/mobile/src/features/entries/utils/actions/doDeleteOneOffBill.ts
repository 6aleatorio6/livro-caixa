import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doDeleteOneOffBill = createAsyncAction({
  run: deleteEntryService,
  shouldShowLoader: true,
  successMessage: 'Conta avulsa excluída.',
});
