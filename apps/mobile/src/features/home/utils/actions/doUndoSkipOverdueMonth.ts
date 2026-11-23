import { undoSkipOverdueMonthService } from '@/shared/services/overdueMonth/skip/undoSkipOverdueMonthService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// Sem `successMessage`: a conta volta às atrasadas do Início, que já mostra o desfeito.
export const doUndoSkipOverdueMonth = createAsyncAction({
  run: undoSkipOverdueMonthService,
  shouldShowLoader: true,
});
