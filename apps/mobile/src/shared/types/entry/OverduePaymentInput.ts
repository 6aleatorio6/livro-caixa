import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/**
 * O que a tela envia ao pagar uma conta atrasada: o valor já confirmado ou corrigido e o comprovante pronto para subir.
 * O pagamento conta no mês de hoje; o `billMonth` é o mês da conta.
 */
export interface IOverduePaymentInput {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês atrasado da conta, anterior ao mês de hoje. */
  billMonth: string;
  amountCents: number;
  receipt: IReceipt;
}
