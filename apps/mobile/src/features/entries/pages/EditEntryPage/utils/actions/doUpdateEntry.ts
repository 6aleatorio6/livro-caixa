import { updateEntryService } from '@/shared/services/entry/updateEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doUpdateEntry = createAsyncAction({
  run: updateEntryService,
  shouldShowLoader: true,
  successMessage: ({ entry }) => (entry.kind === 'recurringPayment' ? 'Pagamento alterado.' : 'Conta avulsa alterada.'),
});
