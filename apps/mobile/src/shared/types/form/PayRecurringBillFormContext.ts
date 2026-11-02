import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';

/** O que o contexto do formulário do pagamento diz ao schema, além do comprovante salvo da alteração. */
export interface IPayRecurringBillFormContext extends Partial<IReceiptFormContext> {
  /** O previsto do mês, em centavos: abaixo de 30% dele, o registro só pode ser uma contribuição. Sem ele, não há mínimo. */
  expectedCents?: number;
  /** A soma das contribuições do mês, em centavos: o pagamento não fica abaixo dela. */
  contributedCents?: number;
}
