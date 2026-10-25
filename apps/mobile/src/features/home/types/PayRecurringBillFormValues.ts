import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que o formulário do pagamento guarda: o formulário o monta na entrada do serviço ao enviar. */
export interface IPayRecurringBillFormValues {
  /** O valor pago, em centavos: começa no previsto da conta; `null` é o campo vazio. */
  amountCents: number | null;
  /** O comprovante escolhido e conferido; `null` é o campo vazio. */
  receipt: IReceipt | null;
}
