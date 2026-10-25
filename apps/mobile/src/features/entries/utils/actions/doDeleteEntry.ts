import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doDeleteEntry = createAsyncAction({
  run: deleteEntryService,
  shouldShowLoader: true,
  successMessage: (entry) => (entry.kind === 'recurringPayment' ? 'Pagamento excluído.' : 'Conta avulsa excluída.'),
});
