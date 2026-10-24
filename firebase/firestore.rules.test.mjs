import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

// Roda contra o emulador do Firestore: `pnpm test:rules`, no PC, que tem o Java.
let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-livro-caixa',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await setDoc(doc(firestore, 'allowedEmails', 'ana@gmail.com'), { name: 'Ana', isAdmin: true, hasEntries: false });
    await setDoc(doc(firestore, 'allowedEmails', 'bruno@gmail.com'), { name: 'Bruno', isAdmin: false, hasEntries: false });
    await setDoc(doc(firestore, 'allowedEmails', 'davi@gmail.com'), { name: 'Davi', isAdmin: false, hasEntries: true });
  });
});

after(() => testEnvironment.cleanup());

function signedInAs(email) {
  return testEnvironment.authenticatedContext('uid-ana', { email, email_verified: true }).firestore();
}

describe('allowedEmails', () => {
  it('Should let a person read the entry of their own e-mail', async () => {
    await assertSucceeds(getDoc(doc(signedInAs('ana@gmail.com'), 'allowedEmails', 'ana@gmail.com')));
  });

  it('Should match the e-mail of the login even with capital letters', async () => {
    await assertSucceeds(getDoc(doc(signedInAs('Ana@Gmail.com'), 'allowedEmails', 'ana@gmail.com')));
  });

  it('Should not let a person read the entry of another e-mail', async () => {
    await assertFails(getDoc(doc(signedInAs('bruno@gmail.com'), 'allowedEmails', 'ana@gmail.com')));
  });

  it('Should not let a person write to the list', async () => {
    await assertFails(setDoc(doc(signedInAs('ana@gmail.com'), 'allowedEmails', 'ana@gmail.com'), { isAdmin: true }));
  });

  it('Should not let a signed-out person read the list', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(firestore, 'allowedEmails', 'ana@gmail.com')));
  });
});

describe('allowedEmails as the admin', () => {
  const newPerson = { name: 'Carla', isAdmin: false, hasEntries: false };
  const entryOf = (firestore, email) => doc(firestore, 'allowedEmails', email);

  it('Should let the admin list the collection', async () => {
    await assertSucceeds(getDocs(collection(signedInAs('ana@gmail.com'), 'allowedEmails')));
  });

  it('Should not let a member list the collection', async () => {
    await assertFails(getDocs(collection(signedInAs('bruno@gmail.com'), 'allowedEmails')));
  });

  it('Should let the admin create a person on a new id', async () => {
    await assertSucceeds(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let the admin create an admin', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, isAdmin: true }));
  });

  it('Should not let the admin create a person who already has entries', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, hasEntries: true }));
  });

  it('Should not let the admin create a person without a name', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { isAdmin: false, hasEntries: false }));
  });

  it('Should not let the admin create a person with an empty name', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, name: '' }));
  });

  it('Should not let the admin create a person with an extra field', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, role: 'owner' }));
  });

  it('Should not let a member create a person', async () => {
    await assertFails(setDoc(entryOf(signedInAs('bruno@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let the admin overwrite an e-mail that is already in the list', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com'), { ...newPerson, name: 'Outro Bruno' }));
  });

  it('Should let the admin delete a person without entries who is not an admin', async () => {
    await assertSucceeds(deleteDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com')));
  });

  it('Should not let the admin delete a person who has entries', async () => {
    await assertFails(deleteDoc(entryOf(signedInAs('ana@gmail.com'), 'davi@gmail.com')));
  });

  it('Should not let the admin delete an admin, themselves included', async () => {
    await assertFails(deleteDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com')));
  });

  it('Should not let a member delete a person', async () => {
    await assertFails(deleteDoc(entryOf(signedInAs('bruno@gmail.com'), 'davi@gmail.com')));
  });

  it('Should not let a member delete a person the admin could delete', async () => {
    await assertFails(deleteDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com')));
  });

  it('Should not let a member promote themselves', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { isAdmin: true }));
  });

  it('Should not let the admin promote another person', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com'), { isAdmin: true }));
  });

  it('Should not let the admin clear hasEntries of a person who has entries', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'davi@gmail.com'), { hasEntries: false }));
  });

  it('Should not treat an admin with an unverified e-mail as an admin', async () => {
    const unverified = testEnvironment.authenticatedContext('uid-ana', { email: 'ana@gmail.com', email_verified: false }).firestore();
    await assertFails(deleteDoc(entryOf(unverified, 'bruno@gmail.com')));
  });

  it('Should not let a person outside the list create their own entry', async () => {
    await assertFails(setDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let the admin create an entry whose id has capital letters', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'Carla@Gmail.com'), newPerson));
  });

  it('Should not let the admin create an entry whose id is not an e-mail', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'qualquer-coisa'), newPerson));
  });

  it('Should not let the admin create a person with a blank name', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, name: '   ' }));
  });
});
