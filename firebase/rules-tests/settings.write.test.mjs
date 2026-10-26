import { beforeEach, describe } from 'node:test';

import { deleteDoc, deleteField, setDoc, updateDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, SEEDED_TAG, asOwner, assertAccess, itEach, rowsFor, settingsDocOf, tagsDocOf } from './setup/index.mjs';

const VALID_ITEMS = { t1: SEEDED_TAG };
const ALL = [...MEMBERS, ...OUTSIDERS];

// O documento `settings/tags` ainda não existe: o primeiro item o cria.
describe('settings create of the tags', () => {
  beforeEach(() => asOwner((firestore) => deleteDoc(tagsDocOf(firestore))));

  const cases = [
    ...rowsFor(MEMBERS, 'create the tags with an item', true, { data: { items: VALID_ITEMS } }),
    ...rowsFor(OUTSIDERS, 'create the tags with an item', false, { data: { items: VALID_ITEMS } }),
    ...rowsFor(MEMBERS, 'create the tags with a key besides items', false, { data: { items: VALID_ITEMS, other: 1 } }),
    ...rowsFor(MEMBERS, 'create the tags with two items', false, { data: { items: { t1: SEEDED_TAG, t2: SEEDED_TAG } } }),
    ...rowsFor(MEMBERS, 'create the tags without items', false, { data: {} }),
    ...rowsFor(MEMBERS, 'create the tags with items as a text', false, { data: { items: 'Casa' } }),
    ...rowsFor(MEMBERS, 'create the tags with items as a list', false, { data: { items: [SEEDED_TAG] } }),
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, setDoc(tagsDocOf(as()), data)));
});

describe('settings update of the tags', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'add an item to the tags', true, { data: { 'items.t2': { name: 'Carro', nameKey: 'carro', color: 'sky' } } }),
    ...rowsFor(OUTSIDERS, 'add an item to the tags', false, { data: { 'items.t2': { name: 'Carro', nameKey: 'carro', color: 'sky' } } }),
    ...rowsFor(MEMBERS, 'rename an item of the tags', true, { data: { 'items.t1.name': 'Lar', 'items.t1.nameKey': 'lar' } }),
    ...rowsFor(OUTSIDERS, 'rename an item of the tags', false, { data: { 'items.t1.name': 'Lar', 'items.t1.nameKey': 'lar' } }),
    ...rowsFor(MEMBERS, 'remove an item from the tags', true, { data: { 'items.t1': deleteField() } }),
    ...rowsFor(OUTSIDERS, 'remove an item from the tags', false, { data: { 'items.t1': deleteField() } }),
    ...rowsFor(MEMBERS, 'recolor an item of the tags', true, { data: { 'items.t1.color': 'moss' } }),
    ...rowsFor(MEMBERS, 'update the tags with a key besides items', false, { data: { other: 1 } }),
    ...rowsFor(MEMBERS, 'update the tags with items as a text', false, { data: { items: 'Casa' } }),
    ...rowsFor(MEMBERS, 'update the tags with items as a list', false, { data: { items: [SEEDED_TAG] } }),
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, updateDoc(tagsDocOf(as()), data)));
});

// Uma escrita muda no máximo um item: quem erra ou abusa do SDK não troca nem apaga as tags de todos de uma vez.
describe('settings update of several items of the tags', () => {
  beforeEach(() =>
    asOwner((firestore) =>
      setDoc(tagsDocOf(firestore), {
        items: { t1: SEEDED_TAG, t2: { name: 'Carro', nameKey: 'carro', color: 'sky' }, t3: { name: 'Lazer', nameKey: 'lazer', color: 'moss' } },
      }),
    ),
  );

  const cases = [
    ...rowsFor(MEMBERS, 'change one item of three', true, { data: { 'items.t2.name': 'Auto', 'items.t2.nameKey': 'auto' } }),
    ...rowsFor(MEMBERS, 'add two items to the tags in one write', false, { data: { 'items.t4': SEEDED_TAG, 'items.t5': SEEDED_TAG } }),
    ...rowsFor(MEMBERS, 'rename two items of the tags in one write', false, { data: { 'items.t1.name': 'Lar', 'items.t2.name': 'Auto' } }),
    ...rowsFor(MEMBERS, 'remove two items from the tags in one write', false, { data: { 'items.t1': deleteField(), 'items.t2': deleteField() } }),
    ...rowsFor(MEMBERS, 'empty the items of the tags', false, { data: { items: {} } }),
    ...rowsFor(MEMBERS, 'replace the items with a map that drops two', false, { data: { items: { t1: SEEDED_TAG } } }),
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, updateDoc(tagsDocOf(as()), data)));
});

describe('settings write of another document', () => {
  beforeEach(() => asOwner((firestore) => setDoc(settingsDocOf(firestore, 'other'), { items: {} })));

  const createCases = rowsFor(ALL, 'create another settings document', false, { data: { items: VALID_ITEMS } });
  const updateCases = rowsFor(ALL, 'update another settings document', false, { data: { items: VALID_ITEMS } });

  itEach(createCases, ({ as, data, isAllowed }) => assertAccess(isAllowed, setDoc(settingsDocOf(as(), 'new'), data)));
  itEach(updateCases, ({ as, data, isAllowed }) => assertAccess(isAllowed, updateDoc(settingsDocOf(as(), 'other'), data)));
});

describe('settings delete of the tags', () => {
  const cases = rowsFor(ALL, 'delete the tags', false);

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, deleteDoc(tagsDocOf(as()))));
});
