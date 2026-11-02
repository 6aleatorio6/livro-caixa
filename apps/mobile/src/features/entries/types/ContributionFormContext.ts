/** O que o contexto do formulário da contribuição diz ao schema. */
export interface IContributionFormContext {
  /**
   * O que ainda falta receber no lançamento registrado, em centavos: a contribuição maior que isso é recusada. `null`
   * no mês ainda a pagar, em que ela pode passar do previsto.
   */
  remainingCents: number | null;
}
