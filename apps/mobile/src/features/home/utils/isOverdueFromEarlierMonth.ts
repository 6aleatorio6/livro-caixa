import type { IBillToPay } from '@/features/home/types/BillToPay';

/** A conta a pagar é uma atrasada de um mês anterior ao atual, que o Início lista no mês de hoje. */
export function isOverdueFromEarlierMonth({ overdue }: Pick<IBillToPay, 'overdue'>) {
  return overdue === 'fromEarlierMonth';
}
