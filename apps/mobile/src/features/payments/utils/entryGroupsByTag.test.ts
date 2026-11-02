import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { ITag } from '@/shared/types/tag/Tag';

import type { IPaymentRow } from '../types/PaymentRow';

import { entryGroupsByTag } from './entryGroupsByTag';

const tag = (id: string, name: string): ITag => ({ id, name, nameKey: name.toLowerCase(), color: 'moss' });
const water = tag('water', 'Água');
const home = tag('home', 'Casa');
const utilities = tag('utilities', 'Serviços');

// A linha de uma conta avulsa sem contribuições: ela conta inteira na lista.
const oneOff = (id: string, tagId: string | null, amountCents: number): IPaymentRow => {
  const entry: IOwnedEntry = {
    id,
    kind: 'oneOffBill',
    date: '2026-10-12',
    month: '2026-10',
    name: id,
    amountCents,
    tagId,
    paidBy: 'uid-bruno',
    receiptFileId: 'f1',
  };
  return { entry, amountCents, countedCents: amountCents, parts: [] };
};

describe('entryGroupsByTag', () => {
  // "Água" vem antes de "Casa" pela ordem do português; pelo código do caractere, o "Á" iria depois do "C".
  it('Should group by tag in alphabetical order, with the untagged group last', () => {
    const entries = [oneOff('a', 'utilities', 100), oneOff('b', null, 200), oneOff('c', 'home', 300), oneOff('d', 'water', 400)];

    expect(entryGroupsByTag(entries, [utilities, home, water]).map((group) => group.tag?.name ?? null)).toEqual([
      'Água',
      'Casa',
      'Serviços',
      null,
    ]);
  });

  // O serviço já entrega o mês do mais recente para o mais antigo: o grupo não reordena.
  it('Should keep the order the rows came in inside a group, and sum the group', () => {
    const groups = entryGroupsByTag([oneOff('late', 'home', 100), oneOff('early', 'home', 250)], [home]);

    expect(groups).toEqual([
      { tag: home, totalCents: 350, rows: [oneOff('late', 'home', 100), oneOff('early', 'home', 250)] },
    ]);
  });

  it('Should put an entry whose tag is not in the list in the untagged group', () => {
    expect(entryGroupsByTag([oneOff('x', 'gone', 300)], [home])).toEqual([
      { tag: null, totalCents: 300, rows: [oneOff('x', 'gone', 300)] },
    ]);
  });

  it('Should be empty without entries', () => {
    expect(entryGroupsByTag([], [home])).toEqual([]);
  });
});

describe('entryGroupsByTag, with parts', () => {
  it('Should sum what each row counts in the list, not the amount paid', () => {
    const row = { ...oneOff('light', 'home', 18735), countedCents: 14735 };

    expect(entryGroupsByTag([row], [home])).toEqual([{ tag: home, totalCents: 14735, rows: [row] }]);
  });
});
