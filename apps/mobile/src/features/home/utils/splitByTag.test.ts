import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { ITag } from '@/shared/types/tag/Tag';

import { monthSummary } from './monthSummary';
import { splitByTag } from './splitByTag';

const tag = (id: string, name: string): ITag => ({ id, name, nameKey: name.toLowerCase(), color: 'moss' });
const home = tag('home', 'Casa');
const health = tag('health', 'Saúde');
const unused = tag('unused', 'Lazer');

const bill = (id: string, tagId: string | null, expectedAmountCents: number): IRecurringBill => ({
  id,
  name: id,
  expectedAmountCents,
  dayOfMonth: 5,
  startsOn: '2026-01-01',
  tagId,
});

const oneOff = (id: string, tagId: string | null, amountCents: number): IEntry => ({
  id,
  kind: 'oneOffBill',
  date: '2026-10-12',
  month: '2026-10',
  name: id,
  amountCents,
  tagId,
  paidBy: 'ana',
  receiptFileId: 'f1',
});

describe('splitByTag', () => {
  it('Should give the paid and the to pay of each tag, from the largest paid to the smallest', () => {
    const summary = monthSummary({
      month: '2026-10',
      bills: [bill('rent', 'home', 100000), bill('plan', 'health', 30000)],
      entries: [oneOff('a', 'home', 2000), oneOff('b', 'health', 9000), oneOff('c', 'health', 1000)],
    });

    expect(splitByTag(summary, [home, health, unused])).toEqual([
      { tag: health, paidCents: 10000, toPayCents: 30000 },
      { tag: home, paidCents: 2000, toPayCents: 100000 },
    ]);
  });

  it('Should keep a tag with only to pay and break a tie by name', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill('a', 'health', 500), bill('b', 'home', 700)], entries: [] });

    expect(splitByTag(summary, [health, home]).map(({ tag }) => tag?.name)).toEqual(['Casa', 'Saúde']);
  });

  // Cada conta tem no máximo uma tag: com a linha sem tag, as linhas somam o mês inteiro.
  it('Should put what has no tag in the last row, with tag null, even when it paid the most', () => {
    const summary = monthSummary({
      month: '2026-10',
      bills: [bill('a', null, 500), bill('rent', 'home', 100000)],
      entries: [oneOff('x', null, 300), oneOff('y', 'home', 100)],
    });

    expect(splitByTag(summary, [home, health])).toEqual([
      { tag: home, paidCents: 100, toPayCents: 100000 },
      { tag: null, paidCents: 300, toPayCents: 500 },
    ]);
  });

  it('Should put an entry or a bill whose tag is not in the list in the untagged row', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill('a', 'gone', 500)], entries: [oneOff('x', 'gone', 300)] });

    expect(splitByTag(summary, [home])).toEqual([{ tag: null, paidCents: 300, toPayCents: 500 }]);
  });

  it('Should be empty when the month has nothing', () => {
    const summary = monthSummary({ month: '2026-10', bills: [], entries: [] });

    expect(splitByTag(summary, [home])).toEqual([]);
  });
});
