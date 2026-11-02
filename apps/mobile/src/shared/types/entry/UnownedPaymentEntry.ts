/**
 * O pagamento sem dono de um mês com contribuições: as cópias da conta, sem quem pagou, sem valor pago e sem
 * comprovante. O total é a soma das contribuições, e o mês está pago quando ela alcança o `expectedAmountCents`.
 * Tem o `kind` do pagamento, como no banco: `paidBy` `null` é o que o separa do pagamento com dono.
 */
export interface IUnownedPaymentEntry {
  id: string;
  kind: 'recurringPayment';
  /** `AAAA-MM`: o mês da conta. */
  month: string;
  name: string;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
  /** O id da conta recorrente; pode apontar para uma conta já excluída. */
  recurringBillId: string;
  /** O dia (1 a 31) em que a conta vencia naquele mês, copiado na primeira contribuição. */
  dueDay: number;
  /** O valor previsto da conta na primeira contribuição, em centavos. */
  expectedAmountCents: number;
  date: null;
  /** `AAAA-MM-DD` da primeira contribuição. */
  paidOn: string;
  paidBy: null;
  amountCents: null;
  receiptFileId: null;
}
