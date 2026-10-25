/** Os campos que todo lançamento da família tem. */
interface IEntryBase {
  id: string;
  /** `AAAA-MM`: o mês em que o lançamento conta. */
  month: string;
  name: string;
  /** O valor pago, em centavos. */
  amountCents: number;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
  /** O uid de quem pagou. */
  paidBy: string;
  /** O id do registro do comprovante em `files`. */
  receiptFileId: string;
}

/** Uma conta avulsa já paga: tem a data do pagamento. */
interface IOneOffBillEntry extends IEntryBase {
  kind: 'oneOffBill';
  /** `AAAA-MM-DD` do pagamento. */
  date: string;
}

/** O pagamento de uma conta recorrente: aponta para a conta e não tem data própria. */
interface IRecurringPaymentEntry extends IEntryBase {
  kind: 'recurringPayment';
  /** O id da conta recorrente; pode apontar para uma conta já excluída. */
  recurringBillId: string;
  /** O dia (1 a 31) em que a conta vencia naquele mês, copiado no pagamento. */
  dueDay: number;
  /** O valor previsto da conta quando foi paga, em centavos, copiado no pagamento. */
  expectedAmountCents: number;
  date: null;
  /** `AAAA-MM-DD` em que o pagamento foi registrado (o `createdAt` pelos campos locais; hoje enquanto o servidor não carimba). */
  paidOn: string;
}

/** Um lançamento da família: uma conta avulsa já paga ou o pagamento de uma conta recorrente. */
export type IEntry = IOneOffBillEntry | IRecurringPaymentEntry;
