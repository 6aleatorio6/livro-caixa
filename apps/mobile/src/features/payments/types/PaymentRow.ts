import type { IMemberPart } from '@/shared/types/entry/MemberPart';

/**
 * Uma linha da lista de Pagamentos: a parte de uma pessoa numa conta, a de quem pagou ou uma contribuição. O
 * `amountCents` é o que a linha soma no total, e `entry`, a conta em que a parte está.
 */
export interface IPaymentRow extends IMemberPart {
  /** Identifica a linha na lista: o id da contribuição, ou `<id da conta>:<uid>` na parte de quem pagou. */
  key: string;
}
