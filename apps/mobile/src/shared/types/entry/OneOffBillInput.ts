import type { IReceipt } from '@/shared/types/file/Receipt';

/** O que a tela envia ao registrar uma conta avulsa já paga: o nome já aparado e o comprovante pronto para subir. */
export interface IOneOffBillInput {
  name: string;
  amountCents: number;
  /** `AAAA-MM-DD`. */
  date: string;
  tagId: string | null;
  receipt: IReceipt;
}
