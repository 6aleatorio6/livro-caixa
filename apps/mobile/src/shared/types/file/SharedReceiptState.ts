import type { IReceipt } from './Receipt';

export interface ISharedReceiptState {
  /** `null` enquanto nenhum comprovante compartilhado espera por uma conta. */
  receipt: IReceipt | null;
}
