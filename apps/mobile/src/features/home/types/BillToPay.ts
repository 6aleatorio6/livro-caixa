import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** Uma conta recorrente que ainda não foi paga no mês, com o vencimento dele. */
export interface IBillToPay {
  bill: IRecurringBill;
  /** `AAAA-MM-DD`. */
  dueDate: string;
}
