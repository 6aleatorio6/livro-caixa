import { describe } from 'node:test';

import { deleteDoc } from 'firebase/firestore';

import { assertAccess, entryOf, itEach, signedInAs, signedInWithUnverifiedEmail, signedOut } from './setup.mjs';

describe('allowedEmails delete', () => {
  // `as` é quem exclui e `email` é a entrada excluída.
  const cases = [
    { title: 'Should let the admin delete a person without entries who is not an admin', as: () => signedInAs('ana@gmail.com'), email: 'bruno@gmail.com', isAllowed: true },
    { title: 'Should not let the admin delete a person who has entries', as: () => signedInAs('ana@gmail.com'), email: 'davi@gmail.com', isAllowed: false },
    { title: 'Should not let the admin delete an admin, themselves included', as: () => signedInAs('ana@gmail.com'), email: 'ana@gmail.com', isAllowed: false },
    { title: 'Should not let a member delete a person', as: () => signedInAs('bruno@gmail.com'), email: 'davi@gmail.com', isAllowed: false },
    { title: 'Should not let a member delete a person the admin could delete', as: () => signedInAs('bruno@gmail.com'), email: 'bruno@gmail.com', isAllowed: false },
    { title: 'Should not let a person outside the list delete a person', as: () => signedInAs('carla@gmail.com'), email: 'bruno@gmail.com', isAllowed: false },
    { title: 'Should not let a signed-out person delete a person', as: () => signedOut(), email: 'bruno@gmail.com', isAllowed: false },
    { title: 'Should not treat an admin with an unverified e-mail as an admin', as: () => signedInWithUnverifiedEmail('ana@gmail.com'), email: 'bruno@gmail.com', isAllowed: false },
  ];

  itEach(cases, ({ as, email, isAllowed }) => assertAccess(isAllowed, deleteDoc(entryOf(as(), email))));
});
