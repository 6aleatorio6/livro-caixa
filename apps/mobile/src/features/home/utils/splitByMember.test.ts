import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IEntry } from '@/shared/types/entry/Entry';

import { splitByMember } from './splitByMember';

const person = (overrides: Partial<IAllowedEmailListItem>): IAllowedEmailListItem => ({
  email: 'ana@example.com',
  name: 'Ana',
  uid: 'ana',
  isAdmin: false,
  hasEntries: true,
  ...overrides,
});

const entry = (paidBy: string, amountCents: number): IEntry => ({
  id: `${paidBy}-${amountCents}`,
  kind: 'oneOffBill',
  date: '2026-10-12',
  month: '2026-10',
  name: 'Conta',
  amountCents,
  tagId: null,
  paidBy,
  receiptFileId: 'f1',
});

describe('splitByMember', () => {
  const people = [person({}), person({ email: 'bruno@example.com', name: 'Bruno', uid: 'bruno' })];

  it('Should add what each person paid, from the largest to the smallest', () => {
    expect(splitByMember([entry('ana', 1000), entry('bruno', 5000), entry('ana', 2000)], people)).toEqual([
      { uid: 'bruno', name: 'Bruno', paidCents: 5000 },
      { uid: 'ana', name: 'Ana', paidCents: 3000 },
    ]);
  });

  it('Should show the current name of a renamed person', () => {
    const renamed = [person({ name: 'Ana Souza' }), people[1]];

    expect(splitByMember([entry('ana', 1000)], renamed)).toEqual([{ uid: 'ana', name: 'Ana', paidCents: 1000 }]);
  });

  it('Should show Alguém for a uid that is not in the list', () => {
    expect(splitByMember([entry('ghost', 700)], people)).toEqual([{ uid: 'ghost', name: 'Alguém', paidCents: 700 }]);
  });

  it('Should be empty without paid entries', () => {
    expect(splitByMember([], people)).toEqual([]);
  });
});
