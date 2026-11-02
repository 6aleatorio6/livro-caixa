import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IEntry } from '@/shared/types/entry/Entry';

import type { IBillToPay } from './BillToPay';

/** O mês da família: o que falta pagar e o que já foi pago, em centavos. */
export interface IMonthSummary {
  /** As contas a pagar, do vencimento mais próximo para o mais distante. */
  toPay: IBillToPay[];
  /** As contas pagas: os lançamentos com dono e os pagamentos sem dono cujas contribuições alcançaram o previsto. */
  paid: IBillEntry[];
  /** Os lançamentos do mês, contribuições incluídas, para somar cada conta e cada parte. */
  entries: IEntry[];
  /** O que falta das contas a pagar: o previsto menos as contribuições. */
  toPayCents: number;
  /** A soma das partes de todos os membros, contribuições de contas ainda a pagar incluídas (pode passar do previsto). */
  paidCents: number;
  /** O pago mais o a pagar: o "Total do mês". */
  totalCents: number;
  /** Quantas contas o mês tem: as a pagar mais as pagas. */
  billCount: number;
}
