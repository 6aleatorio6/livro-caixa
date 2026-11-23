import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** Uma conta recorrente que ainda não foi paga no mês, com o vencimento dele e o que falta. */
export interface IBillToPay {
  bill: IRecurringBill;
  /** `AAAA-MM`: o mês da conta, que é o da rota do pagamento; no mês atual, a atrasada traz o de um mês anterior. */
  month: string;
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
  /**
   * Quando a conta é uma atrasada: `fromEarlierMonth` no mês atual, para a conta de um mês anterior que ficou sem
   * pagamento; `inItsMonth` na tela de um mês anterior ao atual, para a conta sem pagamento no mês dela. Sem o campo,
   * a conta é do mês da tela e ele não passou.
   */
  overdue?: 'fromEarlierMonth' | 'inItsMonth';
}
