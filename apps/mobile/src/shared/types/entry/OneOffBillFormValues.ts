import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que o formulário da conta avulsa guarda; `oneOffBillInputOf` o converte na entrada do serviço. */
export interface IOneOffBillFormValues {
  name: string;
  /** O valor pago, em centavos; `null` é o campo vazio. */
  amountCents: number | null;
  /** `AAAA-MM-DD`. */
  date: string;
  /** O id da tag escolhida; `null` sem tag. */
  tagId: string | null;
  /** O comprovante escolhido e conferido; `null` é o campo vazio. */
  receipt: IReceipt | null;
}
