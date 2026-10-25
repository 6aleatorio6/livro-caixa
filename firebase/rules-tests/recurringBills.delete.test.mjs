import { describe } from 'node:test';

import { deleteDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, itEach, recurringBillOf, rowsFor } from './setup.mjs';

describe('recurringBills delete', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'delete a recurring bill', true),
    ...rowsFor(OUTSIDERS, 'delete a recurring bill', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, deleteDoc(recurringBillOf(as(), 'internet'))));
});
