import { addOneOffBillService } from '@/shared/services/entry/add/addOneOffBillService';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

export const doAddOneOffBill = createAsyncAction({
  run: async (bill: IOneOffBillInput) => {
    const id = await addOneOffBillService(bill);
    // Sem esperar: o loader e o aviso de sucesso não dependem da rede da notificação.
    void notifyFamilyOfEntry({ kind: 'oneOffBill', id, name: bill.name, amountCents: bill.amountCents });
  },
  shouldShowLoader: true,
  successMessage: 'Conta avulsa registrada.',
});
