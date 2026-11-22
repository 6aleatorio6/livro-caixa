import type { IOverdueMonthStatus } from '@/shared/types/overdueMonth/OverdueMonthStatus';

/**
 * O mês atrasado de uma conta recorrente que não está a pagar: pago num mês seguinte ou pulado. Guarda o nome e a tag
 * da conta como estavam, para a conta aparecer mesmo depois de excluída.
 */
export interface IOverdueMonth {
  /** `AAAA-MM_` e o id da conta, o mesmo id que o pagamento do mês teria. */
  id: string;
  status: IOverdueMonthStatus;
  /** `AAAA-MM`: o mês da conta. */
  month: string;
  /** O id da conta recorrente; pode apontar para uma conta já excluída. */
  recurringBillId: string;
  /** O id do pagamento que pagou o mês; `null` no mês pulado. */
  entryId: string | null;
  name: string;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
  /** O uid de quem pulou ou pagou depois. */
  createdBy: string;
  /** `AAAA-MM-DD` em que o mês foi pulado ou pago (o `createdAt` pelos campos locais; hoje enquanto o servidor não carimba). */
  paidOn: string;
}
