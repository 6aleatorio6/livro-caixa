import { payOverdueBillService } from '@/shared/services/entry/add/payOverdueBillService';
import type { IOverduePaymentInput } from '@/shared/types/entry/OverduePaymentInput';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

export const doPayOverdueBill = createAsyncAction({
  run: async (payment: IOverduePaymentInput) => {
    const id = await payOverdueBillService(payment);
    // Sem esperar: o loader e o aviso de sucesso não dependem da rede da notificação.
    void notifyFamilyOfEntry({
      kind: 'overduePayment',
      id,
      month: payment.billMonth,
      name: payment.bill.name,
      amountCents: payment.amountCents,
    });
  },
  shouldShowLoader: true,
  successMessage: 'Pagamento registrado.',
});
