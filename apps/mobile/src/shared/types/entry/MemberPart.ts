import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';

/** A parte de um membro numa conta: a de quem pagou, ou a de uma contribuição dele. */
export interface IMemberPart {
  /** O lançamento da conta em que a parte está. */
  entry: IBillEntry;
  uid: string;
  /** Em centavos. Na parte de quem pagou, o valor pago menos as contribuições: fica negativa se elas passarem dele. */
  amountCents: number;
  /** A contribuição que dá a parte; `null` na parte de quem pagou. */
  contribution: IContributionEntry | null;
}
