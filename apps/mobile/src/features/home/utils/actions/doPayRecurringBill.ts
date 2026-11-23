import { payRecurringBillService } from '@/shared/services/entry/add/payRecurringBillService';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

export const doPayRecurringBill = createAsyncAction({
  run: async (payment: IRecurringPaymentInput) => {
    await payRecurringBillService(payment);
    // Sem esperar: o loader e o aviso de sucesso não dependem da rede da notificação.
    void notifyFamilyOfEntry({
      kind: 'recurringPayment',
      id: `${payment.month}_${payment.bill.id}`,
      month: payment.month,
      name: payment.bill.name,
      amountCents: payment.amountCents,
    });
  },
  shouldShowLoader: true,
  successMessage: 'Pagamento registrado.',
});
