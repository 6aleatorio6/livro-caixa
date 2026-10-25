/** O que o contexto do formulário com comprovante diz ao schema. */
export interface IReceiptFormContext {
  /** O lançamento já tem comprovante salvo (a alteração): o campo deixa de ser obrigatório. */
  hasCurrentReceipt: boolean;
}
