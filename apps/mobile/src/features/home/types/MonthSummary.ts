import type { IEntry } from '@/shared/types/entry/Entry';

import type { IBillToPay } from './BillToPay';

/** O mês da família: o que falta pagar e o que já foi pago, em centavos. */
export interface IMonthSummary {
  /** As contas a pagar, do vencimento mais próximo para o mais distante. */
  toPay: IBillToPay[];
  paid: IEntry[];
  /** A soma dos valores previstos das contas a pagar. */
  toPayCents: number;
  /** A soma dos valores pagos (pode passar do previsto). */
  paidCents: number;
  /** O pago mais o a pagar: o "Total do mês". */
  totalCents: number;
  /** Quantas contas o mês tem: as a pagar mais as pagas. */
  billCount: number;
}
