import { updateRecurringBillService } from '@/shared/services/recurringBill/update/updateRecurringBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doUpdateRecurringBill = createAsyncAction({ run: updateRecurringBillService, successMessage: 'Conta salva' });
