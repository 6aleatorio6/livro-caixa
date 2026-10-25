import { describe } from 'node:test';

import { deleteDoc } from 'firebase/firestore';

import { assertAccess, entryDocOf, entryRowsFor, itEach } from './setup.mjs';

// Só quem pagou apaga: o autor sim, o outro membro e o admin não.
describe('entries delete', () => {
  const cases = entryRowsFor('delete');

  itEach(cases, ({ as, id, isAllowed }) => assertAccess(isAllowed, deleteDoc(entryDocOf(as(), id))));
});
