import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IMemberPart } from '@/shared/types/entry/MemberPart';

/** Uma conta na lista de Pagamentos: o lançamento, o valor pago, quanto dela conta para quem a lista é, e as partes. */
export interface IPaymentRow {
  entry: IBillEntry;
  /** O valor pago da conta, em centavos: o do lançamento, ou a soma das contribuições no pagamento sem dono. */
  amountCents: number;
  /** Quanto da conta conta no total da lista: a parte do membro escolhido, ou a conta inteira em "Todos". */
  countedCents: number;
  /** As partes de todos os membros na conta: a de quem pagou e as contribuições. */
  parts: IMemberPart[];
}
