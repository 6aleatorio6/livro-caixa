import { describe } from 'node:test';

import { getDoc, getDocs, query, where } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, entriesOf, entryDocOf, itEach, rowsFor } from './setup.mjs';

describe('entries get', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'read an entry of another person', true, { id: 'ana1' }),
    ...rowsFor(MEMBERS, 'read an entry of their own', true, { id: 'bruno1' }),
    ...rowsFor(OUTSIDERS, 'read an entry', false, { id: 'bruno1' }),
  ];

  itEach(cases, ({ as, id, isAllowed }) => assertAccess(isAllowed, getDoc(entryDocOf(as(), id))));
});

describe('entries list by month', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'list the entries of a month', true),
    ...rowsFor(OUTSIDERS, 'list the entries of a month', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(query(entriesOf(as()), where('month', '==', '2026-09')))));
});
