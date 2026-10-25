import { beforeEach, describe, it } from 'node:test';

import { assertFails } from '@firebase/rules-unit-testing';
import { setDoc, updateDoc } from 'firebase/firestore';

import {
  asOwner,
  assertAccess,
  entryOf,
  itEach,
  signedInAs,
  signedInWithUnverifiedEmail,
  signedOut,
} from './setup.mjs';

// Em cada tabela, `as` é quem muda, `email` é a entrada e `data` são os campos que ele grava.
describe('allowedEmails update of the own entry', () => {
  const ana = () => signedInAs('ana@gmail.com');
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member change their own name', as: bruno, email: 'bruno@gmail.com', data: { name: 'Bruno S.' }, isAllowed: true },
    { title: 'Should let the admin change their own name', as: ana, email: 'ana@gmail.com', data: { name: 'Ana Souza' }, isAllowed: true },
    { title: 'Should let a member change their own name when the login has capital letters', as: () => signedInAs('Bruno@Gmail.com'), email: 'bruno@gmail.com', data: { name: 'Bruno S.' }, isAllowed: true },
    { title: 'Should let a person with no uid yet change their name', as: () => signedInAs('davi@gmail.com'), email: 'davi@gmail.com', data: { name: 'Davi S.' }, isAllowed: true },
    { title: 'Should not let a person replace a uid already saved', as: () => signedInAs('bruno@gmail.com', 'uid-other'), email: 'bruno@gmail.com', data: { name: 'Bruno S.', uid: 'uid-other' }, isAllowed: false },
    { title: 'Should not let a member change their own name to an empty one', as: bruno, email: 'bruno@gmail.com', data: { name: '' }, isAllowed: false },
    { title: 'Should not let a member change their own name to only spaces', as: bruno, email: 'bruno@gmail.com', data: { name: '   ' }, isAllowed: false },
    { title: 'Should not let a member change their own name to a number', as: bruno, email: 'bruno@gmail.com', data: { name: 42 }, isAllowed: false },
    { title: 'Should not let a member change their own name to null', as: bruno, email: 'bruno@gmail.com', data: { name: null }, isAllowed: false },
    { title: 'Should let a member change their own name to one of 60 characters', as: bruno, email: 'bruno@gmail.com', data: { name: 'a'.repeat(60) }, isAllowed: true },
    { title: 'Should not let a member change their own name to one of 61 characters', as: bruno, email: 'bruno@gmail.com', data: { name: 'a'.repeat(61) }, isAllowed: false },
    { title: 'Should not let a member change their own name along with another field', as: bruno, email: 'bruno@gmail.com', data: { name: 'Bruno S.', role: 'owner' }, isAllowed: false },
    { title: 'Should not let a member promote themselves', as: bruno, email: 'bruno@gmail.com', data: { isAdmin: true }, isAllowed: false },
    { title: 'Should not let a member promote themselves while changing their name', as: bruno, email: 'bruno@gmail.com', data: { name: 'Bruno S.', isAdmin: true }, isAllowed: false },
    { title: 'Should not let a member who has entries clear their own hasEntries', as: () => signedInAs('davi@gmail.com'), email: 'davi@gmail.com', data: { hasEntries: false }, isAllowed: false },
    { title: 'Should not let a member change their own hasEntries along with the name', as: bruno, email: 'bruno@gmail.com', data: { name: 'Bruno S.', hasEntries: true }, isAllowed: false },
    { title: 'Should not let a member change their own uid', as: bruno, email: 'bruno@gmail.com', data: { uid: 'uid-other' }, isAllowed: false },
    { title: 'Should not let a member change their own uid along with the name', as: bruno, email: 'bruno@gmail.com', data: { name: 'Bruno S.', uid: 'uid-other' }, isAllowed: false },
    { title: 'Should not let the admin change their own isAdmin', as: ana, email: 'ana@gmail.com', data: { isAdmin: false }, isAllowed: false },
    { title: 'Should not let the admin change their own uid', as: ana, email: 'ana@gmail.com', data: { uid: 'uid-other' }, isAllowed: false },
    { title: 'Should not let the admin change their own name to an empty one', as: ana, email: 'ana@gmail.com', data: { name: '' }, isAllowed: false },
    { title: 'Should not let the admin change their own name to only spaces', as: ana, email: 'ana@gmail.com', data: { name: '   ' }, isAllowed: false },
  ];

  itEach(cases, ({ as, email, data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryOf(as(), email), data)));

  it('Should not let a person write to the list', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { isAdmin: true }));
  });
});

// O `hasEntries` só sobe: a própria pessoa marca `true` ao gravar o primeiro lançamento, no lote dele.
describe('allowedEmails update of hasEntries', () => {
  const ana = () => signedInAs('ana@gmail.com');
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member mark their own hasEntries', as: bruno, email: 'bruno@gmail.com', data: { hasEntries: true }, isAllowed: true },
    { title: 'Should let the admin mark their own hasEntries', as: ana, email: 'ana@gmail.com', data: { hasEntries: true }, isAllowed: true },
    { title: 'Should not let a member mark the hasEntries of another person', as: bruno, email: 'ana@gmail.com', data: { hasEntries: true }, isAllowed: false },
    { title: 'Should not let the admin mark the hasEntries of another person', as: ana, email: 'bruno@gmail.com', data: { hasEntries: true }, isAllowed: false },
    { title: 'Should not let a signed-out person mark a hasEntries', as: () => signedOut(), email: 'bruno@gmail.com', data: { hasEntries: true }, isAllowed: false },
    { title: 'Should not let a member with an unverified e-mail mark their own hasEntries', as: () => signedInWithUnverifiedEmail('bruno@gmail.com'), email: 'bruno@gmail.com', data: { hasEntries: true }, isAllowed: false },
    { title: 'Should not let a person outside the list mark a hasEntries', as: () => signedInAs('carla@gmail.com'), email: 'bruno@gmail.com', data: { hasEntries: true }, isAllowed: false },
    { title: 'Should not let a member mark their own hasEntries along with isAdmin', as: bruno, email: 'bruno@gmail.com', data: { hasEntries: true, isAdmin: true }, isAllowed: false },
  ];

  itEach(cases, ({ as, email, data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryOf(as(), email), data)));
});

describe('allowedEmails update of the entry of another person', () => {
  const cases = [
    { title: 'Should not let a member change the name of another person', as: () => signedInAs('bruno@gmail.com'), email: 'davi@gmail.com', data: { name: 'Davi S.' } },
    { title: 'Should not let the admin change the name of another person', as: () => signedInAs('ana@gmail.com'), email: 'bruno@gmail.com', data: { name: 'Bruno S.' } },
    { title: 'Should not let the admin promote another person', as: () => signedInAs('ana@gmail.com'), email: 'bruno@gmail.com', data: { isAdmin: true } },
    { title: 'Should not let the admin clear hasEntries of a person who has entries', as: () => signedInAs('ana@gmail.com'), email: 'davi@gmail.com', data: { hasEntries: false } },
    { title: 'Should not let a person outside the list change a name', as: () => signedInAs('carla@gmail.com'), email: 'bruno@gmail.com', data: { name: 'Bruno S.' } },
    { title: 'Should not let a signed-out person change a name', as: () => signedOut(), email: 'bruno@gmail.com', data: { name: 'Bruno S.' } },
    { title: 'Should not let a member with an unverified e-mail change their own name', as: () => signedInWithUnverifiedEmail('bruno@gmail.com'), email: 'bruno@gmail.com', data: { name: 'Bruno S.' } },
  ];

  itEach(cases, ({ as, email, data }) => assertFails(updateDoc(entryOf(as(), email), data)));
});

// A Carla está na lista e ainda não entrou: sem nome nem `uid`. A primeira entrada grava os dois.
describe('allowedEmails update on the first entry', () => {
  beforeEach(() => asOwner((firestore) => setDoc(entryOf(firestore, 'carla@gmail.com'), { isAdmin: false, hasEntries: false })));

  const carla = () => signedInAs('carla@gmail.com');
  const cases = [
    { title: 'Should let a person on the first entry set the name and their own uid', as: carla, data: { name: 'Carla Lima', uid: 'uid-carla' }, isAllowed: true },
    { title: 'Should let the first entry happen with capital letters in the login', as: () => signedInAs('Carla@Gmail.com'), data: { name: 'Carla Lima', uid: 'uid-carla' }, isAllowed: true },
    { title: 'Should not let a person set the uid of another login', as: carla, data: { name: 'Carla Lima', uid: 'uid-bruno' }, isAllowed: false },
    { title: 'Should not let a person set only the uid, without a name', as: carla, data: { uid: 'uid-carla' }, isAllowed: false },
    { title: 'Should not let a person set the uid with an empty name', as: carla, data: { name: '', uid: 'uid-carla' }, isAllowed: false },
    { title: 'Should not let a person set the uid with a name of 61 characters', as: carla, data: { name: 'a'.repeat(61), uid: 'uid-carla' }, isAllowed: false },
    { title: 'Should not let a person set a uid that is not a string', as: carla, data: { name: 'Carla Lima', uid: 42 }, isAllowed: false },
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryOf(as(), 'carla@gmail.com'), data)));
});
