import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';

// Os lançamentos dos testes de unidade das contribuições, em outubro de 2026, com os valores dos exemplos da página
// Contribuição.

/** A contribuição de `paidBy` em `entryId`, de `amountCents`. */
export function contributionOf(entryId: string, paidBy: string, amountCents: number): IContributionEntry {
  return {
    id: `c-${entryId}-${paidBy}-${amountCents}`,
    kind: 'contribution',
    month: '2026-10',
    entryId,
    amountCents,
    paidBy,
    receiptFileId: `f-${paidBy}`,
    paidOn: '2026-10-10',
  };
}
