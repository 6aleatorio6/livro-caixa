import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que a tela envia ao registrar o pagamento de uma conta recorrente num mês: o valor já confirmado ou corrigido e o comprovante pronto para subir. */
export interface IRecurringPaymentInput {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês que a conta paga. */
  month: string;
  amountCents: number;
  receipt: IReceipt;
}
