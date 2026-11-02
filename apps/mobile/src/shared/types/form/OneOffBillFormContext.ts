import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';

/** O que o contexto do formulário da conta avulsa diz ao schema, além do comprovante salvo da alteração. */
export interface IOneOffBillFormContext extends Partial<IReceiptFormContext> {
  /** A soma das contribuições que a conta recebeu, em centavos: o valor não fica abaixo dela. */
  contributedCents?: number;
  /** `AAAA-MM`: com contribuições, a data só muda dentro deste mês, que é o delas. `null` sem a trava. */
  lockedMonth?: string | null;
}
