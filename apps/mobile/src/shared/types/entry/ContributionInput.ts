import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/**
 * O que a tela envia ao registrar uma contribuição: o lançamento que a recebe, ou a conta e o mês ainda a pagar, o
 * valor já confirmado e o comprovante pronto para subir.
 */
export interface IContributionInput {
  target: { entry: IBillEntry } | { bill: IRecurringBill; month: string };
  amountCents: number;
  receipt: IReceipt;
}
