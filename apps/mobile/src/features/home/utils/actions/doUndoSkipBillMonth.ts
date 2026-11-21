import { undoSkipBillMonthService } from '@/shared/services/billMonth/skip/undoSkipBillMonthService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// Sem `successMessage`: a conta volta às atrasadas do Início, que já mostra o desfeito.
export const doUndoSkipBillMonth = createAsyncAction({
  run: undoSkipBillMonthService,
  shouldShowLoader: true,
});
