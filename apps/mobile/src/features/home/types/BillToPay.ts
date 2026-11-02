import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** Uma conta recorrente que ainda não foi paga no mês, com o vencimento dele e o que falta. */
export interface IBillToPay {
  bill: IRecurringBill;
  /** O nome da conta no mês: o do pagamento sem dono, se o mês tem contribuições (não segue mais a conta), ou o da conta. */
  name: string;
  /** A tag da conta no mês, pela mesma regra do nome; `null` sem tag. */
  tagId: string | null;
  /** `AAAA-MM-DD`. */
  dueDate: string;
  /** O pagamento sem dono do mês, se já tem contribuições: o previsto e o vencimento vêm dele. */
  payment: IUnownedPaymentEntry | null;
  /** As contribuições do mês na conta. */
  contributions: IContributionEntry[];
  /** O previsto menos as contribuições, em centavos. */
  remainingCents: number;
}
