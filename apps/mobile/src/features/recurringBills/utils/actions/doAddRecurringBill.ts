import { addRecurringBillService } from '@/shared/services/recurringBill/add/addRecurringBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doAddRecurringBill = createAsyncAction({ run: addRecurringBillService, successMessage: 'Conta cadastrada' });
