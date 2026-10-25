import { describe } from 'node:test';

import { getDoc, getDocs } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, itEach, recurringBillOf, recurringBillsOf, rowsFor } from './setup.mjs';

describe('recurringBills get', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'read a recurring bill', true),
    ...rowsFor(OUTSIDERS, 'read a recurring bill', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(recurringBillOf(as(), 'internet'))));
});

describe('recurringBills list', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'list the recurring bills', true),
    ...rowsFor(OUTSIDERS, 'list the recurring bills', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(recurringBillsOf(as()))));
});
