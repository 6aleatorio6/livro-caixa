import { addOneOffBillService } from '@/shared/services/entry/add/addOneOffBillService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doAddOneOffBill = createAsyncAction({
  run: addOneOffBillService,
  shouldShowLoader: true,
  successMessage: 'Conta avulsa registrada.',
});
