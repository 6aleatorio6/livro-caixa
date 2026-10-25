import { describe } from 'node:test';

import { setDoc } from 'firebase/firestore';

import { assertAccess, entryOf, itEach, signedInAs, signedInWithUnverifiedEmail, signedOut } from './setup.mjs';

const NEW_PERSON = { isAdmin: false, hasEntries: false };

describe('allowedEmails create', () => {
  // `as` é quem cria, `email` é o id do documento e `person` são os campos que ele grava.
  const cases = [
    { title: 'Should let the admin create a person without name and uid', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: NEW_PERSON, isAllowed: true },
    { title: 'Should not let the admin create a person with a name', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: { ...NEW_PERSON, name: 'Carla' }, isAllowed: false },
    { title: 'Should not let the admin create a person with a uid', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: { ...NEW_PERSON, uid: 'uid-carla' }, isAllowed: false },
    { title: 'Should not let the admin create a person with an extra field', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: { ...NEW_PERSON, role: 'owner' }, isAllowed: false },
    { title: 'Should not let the admin create an admin', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: { ...NEW_PERSON, isAdmin: true }, isAllowed: false },
    { title: 'Should not let the admin create a person who already has entries', as: () => signedInAs('ana@gmail.com'), email: 'carla@gmail.com', person: { ...NEW_PERSON, hasEntries: true }, isAllowed: false },
    { title: 'Should not let the admin create an entry whose id has capital letters', as: () => signedInAs('ana@gmail.com'), email: 'Carla@Gmail.com', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not let the admin create an entry whose id is not an e-mail', as: () => signedInAs('ana@gmail.com'), email: 'qualquer-coisa', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not let the admin overwrite an e-mail that is already in the list', as: () => signedInAs('ana@gmail.com'), email: 'bruno@gmail.com', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not let a member create a person', as: () => signedInAs('bruno@gmail.com'), email: 'carla@gmail.com', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not let a person outside the list create their own entry', as: () => signedInAs('carla@gmail.com'), email: 'carla@gmail.com', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not let a signed-out person create a person', as: () => signedOut(), email: 'carla@gmail.com', person: NEW_PERSON, isAllowed: false },
    { title: 'Should not treat an admin with an unverified e-mail as an admin', as: () => signedInWithUnverifiedEmail('ana@gmail.com'), email: 'carla@gmail.com', person: NEW_PERSON, isAllowed: false },
  ];

  itEach(cases, ({ as, email, person, isAllowed }) => assertAccess(isAllowed, setDoc(entryOf(as(), email), person)));
});
