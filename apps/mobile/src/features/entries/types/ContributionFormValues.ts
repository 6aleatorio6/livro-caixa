import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que o formulário da contribuição guarda: o valor e o comprovante. */
export interface IContributionFormValues {
  /** O valor contribuído, em centavos; `null` é o campo vazio. */
  amountCents: number | null;
  /** O comprovante escolhido e conferido; `null` é o campo vazio. */
  receipt: IReceipt | null;
}
