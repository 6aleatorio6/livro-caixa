import type { IEntry } from '@/shared/types/entry/Entry';
import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que o pagamento de conta recorrente deixa mudar: só o valor pago. */
interface IPaymentChanges {
  amountCents: number;
}

/** O que a conta avulsa deixa mudar: o nome já aparado, o valor, a data (o mês sai dela) e a tag (`null` tira). */
interface IOneOffBillChanges {
  name: string;
  amountCents: number;
  /** `AAAA-MM-DD`. */
  date: string;
  tagId: string | null;
}

/**
 * O que a tela envia ao alterar um lançamento: o lançamento como está, os campos que o tipo dele deixa
 * mudar (`IPaymentChanges` no pagamento, `IOneOffBillChanges` na avulsa) e o comprovante novo, ou `null`
 * para manter o que já tem.
 */
export interface IUpdateEntryInput {
  entry: IEntry;
  changes: IPaymentChanges | IOneOffBillChanges;
  receipt: IReceipt | null;
}
