import { describe } from 'node:test';

import { collection, getDoc, getDocs } from 'firebase/firestore';

import { assertAccess, entryOf, itEach, signedInAs, signedInWithUnverifiedEmail, signedOut } from './setup.mjs';

describe('allowedEmails get', () => {
  const cases = [
    { title: 'Should let the admin read the entry of their own e-mail', as: () => signedInAs('ana@gmail.com'), email: 'ana@gmail.com', isAllowed: true },
    { title: 'Should let a member read the entry of their own e-mail', as: () => signedInAs('bruno@gmail.com'), email: 'bruno@gmail.com', isAllowed: true },
    { title: 'Should match the e-mail of the login even with capital letters', as: () => signedInAs('Ana@Gmail.com'), email: 'ana@gmail.com', isAllowed: true },
    { title: 'Should let the admin read the entry of another e-mail', as: () => signedInAs('ana@gmail.com'), email: 'bruno@gmail.com', isAllowed: true },
    { title: 'Should not let a member read the entry of another e-mail', as: () => signedInAs('bruno@gmail.com'), email: 'ana@gmail.com', isAllowed: false },
    { title: 'Should not let a person outside the list read the entry of another e-mail', as: () => signedInAs('carla@gmail.com'), email: 'ana@gmail.com', isAllowed: false },
    { title: 'Should not let a signed-out person read an entry', as: () => signedOut(), email: 'ana@gmail.com', isAllowed: false },
  ];

  itEach(cases, ({ as, email, isAllowed }) => assertAccess(isAllowed, getDoc(entryOf(as(), email))));
});

describe('allowedEmails list', () => {
  const cases = [
    { title: 'Should let the admin list the collection', as: () => signedInAs('ana@gmail.com'), isAllowed: true },
    { title: 'Should let a member list the collection', as: () => signedInAs('bruno@gmail.com'), isAllowed: true },
    { title: 'Should let a member with capital letters in the login list the collection', as: () => signedInAs('Bruno@Gmail.com'), isAllowed: true },
    { title: 'Should not let a person outside the list list the collection', as: () => signedInAs('carla@gmail.com'), isAllowed: false },
    { title: 'Should not let a signed-out person list the collection', as: () => signedOut(), isAllowed: false },
    { title: 'Should not let a member with an unverified e-mail list the collection', as: () => signedInWithUnverifiedEmail('bruno@gmail.com'), isAllowed: false },
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(collection(as(), 'allowedEmails'))));
});
