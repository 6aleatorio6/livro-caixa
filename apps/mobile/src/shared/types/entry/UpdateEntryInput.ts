import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que o pagamento de conta recorrente e a contribuição deixam mudar: só o valor. */
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
 * mudar (`IPaymentChanges` no pagamento e na contribuição, `IOneOffBillChanges` na avulsa) e o comprovante novo, ou `null`
 * para manter o que já tem.
 */
export interface IUpdateEntryInput {
  entry: IAuthoredEntry;
  changes: IPaymentChanges | IOneOffBillChanges;
  receipt: IReceipt | null;
}
