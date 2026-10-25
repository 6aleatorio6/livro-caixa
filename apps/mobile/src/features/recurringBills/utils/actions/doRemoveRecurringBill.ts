import { removeRecurringBillService } from '@/shared/services/recurringBill/remove/removeRecurringBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doRemoveRecurringBill = createAsyncAction({ run: removeRecurringBillService, successMessage: 'Conta excluída' });
