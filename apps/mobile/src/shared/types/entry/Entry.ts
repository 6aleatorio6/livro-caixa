/** Um lançamento da família: uma conta avulsa já paga ou o pagamento de uma conta recorrente. */
export interface IEntry {
  id: string;
  kind: 'oneOffBill' | 'recurringPayment';
  /** `AAAA-MM`: o mês em que o lançamento conta. */
  month: string;
  name: string;
  /** O valor pago, em centavos. */
  amountCents: number;
  /** `AAAA-MM-DD` do pagamento; `null` quando o lançamento não tem data. */
  date: string | null;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
  /** O uid de quem pagou. */
  paidBy: string;
}
