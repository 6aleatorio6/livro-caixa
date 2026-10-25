import { updateEntryService } from '@/shared/services/entry/updateEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doUpdatePayment = createAsyncAction({
  run: updateEntryService,
  shouldShowLoader: true,
  successMessage: 'Pagamento alterado.',
});
