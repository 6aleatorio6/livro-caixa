import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';

/** O que o contexto do formulário da contribuição diz ao schema, além do comprovante salvo da alteração. */
export interface IContributionFormContext extends Partial<IReceiptFormContext> {
  /**
   * O que ainda falta receber no lançamento registrado, em centavos: a contribuição maior que isso é recusada. `null`
   * no mês ainda a pagar, em que ela pode passar do previsto.
   */
  remainingCents: number | null;
}
