import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { tagUsageParts } from './tagUsageParts';

const bill = (id: string, tagId: string | null): IRecurringBill => ({
  id,
  name: id,
  expectedAmountCents: 1000,
  dayOfMonth: 5,
  startsOn: '2026-01-01',
  tagId,
});

describe('tagUsageParts', () => {
  const bills = [bill('a', 'casa'), bill('b', 'casa'), bill('c', 'saude'), bill('d', null)];

  it('Should list the recurring bills first and count each one-off bill of the tag', () => {
    expect(tagUsageParts(bills, ['casa', 'servicos', 'casa', 'casa'], 'casa')).toEqual([
      '2 contas recorrentes',
      '3 contas avulsas',
    ]);
  });

  it('Should write the singular for one bill of each kind', () => {
    expect(tagUsageParts(bills, ['saude'], 'saude')).toEqual(['1 conta recorrente', '1 conta avulsa']);
  });

  it('Should list only the one-off bills when no recurring bill uses the tag', () => {
    expect(tagUsageParts(bills, ['servicos'], 'servicos')).toEqual(['1 conta avulsa']);
  });

  it('Should list nothing when nothing uses the tag', () => {
    expect(tagUsageParts(bills, ['casa'], 'mercado')).toEqual([]);
  });
});
