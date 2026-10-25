import { updateEntryService } from '@/shared/services/entry/updateEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doUpdateOneOffBill = createAsyncAction({
  run: updateEntryService,
  shouldShowLoader: true,
  successMessage: 'Conta avulsa alterada.',
});
