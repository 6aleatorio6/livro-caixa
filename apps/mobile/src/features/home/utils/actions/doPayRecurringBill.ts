import { payRecurringBillService } from '@/shared/services/entry/add/payRecurringBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doPayRecurringBill = createAsyncAction({
  run: payRecurringBillService,
  shouldShowLoader: true,
  successMessage: 'Pagamento registrado.',
});
