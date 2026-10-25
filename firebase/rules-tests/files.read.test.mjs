import { describe } from 'node:test';

import { collection, getDoc, getDocs } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, fileOf, itEach, rowsFor } from './setup.mjs';

// Todo membro vê o registro de qualquer comprovante (o dono, outro membro e o admin), mas ninguém lista os registros.
describe('files get', () => {
  const cases = [
    // Bruno é o dono de `fbruno1` e outro membro em `fana1`; Ana é o admin em `fbruno1`.
    ...rowsFor(MEMBERS, 'read the file record of a member', true, { id: 'fbruno1' }),
    ...rowsFor(MEMBERS.slice(0, 1), 'read the file record of another person', true, { id: 'fana1' }),
    ...rowsFor(OUTSIDERS, 'read a file record', false, { id: 'fbruno1' }),
  ];

  itEach(cases, ({ as, id, isAllowed }) => assertAccess(isAllowed, getDoc(fileOf(as(), id))));
});

describe('files list', () => {
  const cases = [...rowsFor(MEMBERS, 'list the file records', false), ...rowsFor(OUTSIDERS, 'list the file records', false)];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(collection(as(), 'files'))));
});
