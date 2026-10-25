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

    expect(splitByTag(summary, [health, home]).map(({ tag: { name } }) => name)).toEqual(['Casa', 'Saúde']);
  });

  it('Should leave out the untagged entries and bills', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill('a', null, 500)], entries: [oneOff('x', null, 300)] });

    expect(splitByTag(summary, [home])).toEqual([]);
  });

  it('Should leave out a tagId that is not in the tags list', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill('a', 'gone', 500)], entries: [oneOff('x', 'gone', 300)] });

    expect(splitByTag(summary, [home])).toEqual([]);
  });

  it('Should be empty without tags', () => {
    const summary = monthSummary({ month: '2026-10', bills: [], entries: [oneOff('x', 'home', 300)] });

    expect(splitByTag(summary, [])).toEqual([]);
  });
});
