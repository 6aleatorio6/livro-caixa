import { beforeEach, describe } from 'node:test';

import { getDoc, setDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, asOwner, assertAccess, itEach, rowsFor, settingsDocOf, tagsDocOf } from './setup.mjs';

describe('settings get of the tags', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'read the tags', true),
    ...rowsFor(OUTSIDERS, 'read the tags', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(tagsDocOf(as()))));
});

// Só `settings/tags` é aberto: qualquer outro documento de `settings` continua negado.
describe('settings get of another document', () => {
  beforeEach(() => asOwner((firestore) => setDoc(settingsDocOf(firestore, 'other'), { items: {} })));

  const cases = [
    ...rowsFor(MEMBERS, 'read another settings document', false),
    ...rowsFor(OUTSIDERS, 'read another settings document', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(settingsDocOf(as(), 'other'))));
});
