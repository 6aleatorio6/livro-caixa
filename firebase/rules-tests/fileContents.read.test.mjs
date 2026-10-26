import { describe } from 'node:test';

import { collection, getDoc, getDocs } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, fileContentOf, itEach, rowsFor } from './setup/index.mjs';

// Todo membro abre o conteúdo de qualquer comprovante (o dono, outro membro e o admin), mas ninguém lista os conteúdos.
describe('fileContents get', () => {
  const cases = [
    // Bruno é o dono de `fbruno1` e outro membro em `fana1`; Ana é o admin em `fbruno1`.
    ...rowsFor(MEMBERS, 'read the content of a member', true, { id: 'fbruno1' }),
    ...rowsFor(MEMBERS.slice(0, 1), 'read the content of another person', true, { id: 'fana1' }),
    ...rowsFor(OUTSIDERS, 'read a content', false, { id: 'fbruno1' }),
  ];

  itEach(cases, ({ as, id, isAllowed }) => assertAccess(isAllowed, getDoc(fileContentOf(as(), id))));
});

describe('fileContents list', () => {
  const cases = [...rowsFor(MEMBERS, 'list the contents', false), ...rowsFor(OUTSIDERS, 'list the contents', false)];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(collection(as(), 'fileContents'))));
});
