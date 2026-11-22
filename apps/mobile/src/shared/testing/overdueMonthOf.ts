import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';

// Os meses de conta dos testes de unidade, de outubro de 2026.

/** O mês de conta, por padrão a Internet de outubro que a Ana pulou em 3 de novembro. */
export function overdueMonthOf(overrides: Partial<IOverdueMonth> = {}): IOverdueMonth {
  return {
    id: '2026-10_internet',
    status: 'skipped',
    month: '2026-10',
    recurringBillId: 'internet',
    entryId: null,
    name: 'Internet',
    tagId: 'casa',
    createdBy: 'ana',
    paidOn: '2026-11-03',
    ...overrides,
  };
}
