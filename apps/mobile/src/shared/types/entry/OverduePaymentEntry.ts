/**
 * O pagamento de uma conta atrasada feito num mês seguinte, por quem pagou sem contribuições: tem os campos do
 * pagamento com dono e conta no mês em que foi pago (`month`), com o `billMonth` dizendo de que mês é a conta.
 */
export interface IOverduePaymentEntry {
  id: string;
  kind: 'overduePayment';
  /** `AAAA-MM`: o mês em que o pagamento foi feito e em que ele conta. */
  month: string;
  /** `AAAA-MM`: o mês da conta atrasada, anterior ao `month`; dele sai o selo "De outubro". */
  billMonth: string;
  name: string;
  /** O valor pago, em centavos. */
  amountCents: number;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
  /** O uid de quem pagou. */
  paidBy: string;
  /** O id do registro do comprovante em `files`. */
  receiptFileId: string;
  /** O id da conta recorrente; pode apontar para uma conta já excluída. */
  recurringBillId: string;
  /** O dia (1 a 31) em que a conta vencia no mês dela, copiado no pagamento. */
  dueDay: number;
  /** O valor previsto da conta quando foi paga, em centavos, copiado no pagamento. */
  expectedAmountCents: number;
  date: null;
  /** `AAAA-MM-DD` em que o pagamento foi registrado (o `createdAt` pelos campos locais; hoje enquanto o servidor não carimba). */
  paidOn: string;
}
