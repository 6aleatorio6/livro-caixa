import { payOverdueBillService } from '@/shared/services/entry/add/payOverdueBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doPayOverdueBill = createAsyncAction({
  run: payOverdueBillService,
  shouldShowLoader: true,
  successMessage: 'Pagamento registrado.',
});
