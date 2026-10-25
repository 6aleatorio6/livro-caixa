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

// Ana (admin) e Bruno (membro) já entraram, então têm o `uid` do login gravado; Davi (membro com
// lançamentos) está na lista e ainda não entrou, sem `uid`. Carla não está.
beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await setDoc(doc(firestore, 'allowedEmails', 'ana@gmail.com'), { name: 'Ana', uid: 'uid-ana', isAdmin: true, hasEntries: false });
    await setDoc(doc(firestore, 'allowedEmails', 'bruno@gmail.com'), { name: 'Bruno', uid: 'uid-bruno', isAdmin: false, hasEntries: false });
    await setDoc(doc(firestore, 'allowedEmails', 'davi@gmail.com'), { name: 'Davi', isAdmin: false, hasEntries: true });
  });
});

after(() => testEnvironment.cleanup());

// O `uid` do login é o da pessoa (`uid-ana` para ana@gmail.com), a não ser que o teste dê outro.
function uidOf(email) {
  return `uid-${email.split('@')[0].toLowerCase()}`;
}

function signedInAs(email, uid = uidOf(email)) {
  return testEnvironment.authenticatedContext(uid, { email, email_verified: true }).firestore();
}

function signedInWithUnverifiedEmail(email) {
  return testEnvironment.authenticatedContext(uidOf(email), { email, email_verified: false }).firestore();
}

const entryOf = (firestore, email) => doc(firestore, 'allowedEmails', email);

describe('allowedEmails read', () => {
  it('Should let a person read the entry of their own e-mail', async () => {
    await assertSucceeds(getDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com')));
    await assertSucceeds(getDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com')));
  });

  it('Should match the e-mail of the login even with capital letters', async () => {
    await assertSucceeds(getDoc(entryOf(signedInAs('Ana@Gmail.com'), 'ana@gmail.com')));
  });

  it('Should let the admin read the entry of another e-mail', async () => {
    await assertSucceeds(getDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com')));
  });

  it('Should not let a member read the entry of another e-mail', async () => {
    await assertFails(getDoc(entryOf(signedInAs('bruno@gmail.com'), 'ana@gmail.com')));
  });

  it('Should not let a person outside the list read the entry of another e-mail', async () => {
    await assertFails(getDoc(entryOf(signedInAs('carla@gmail.com'), 'ana@gmail.com')));
  });

  it('Should not let a signed-out person read an entry', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(entryOf(firestore, 'ana@gmail.com')));
  });

  it('Should let the admin list the collection', async () => {
    await assertSucceeds(getDocs(collection(signedInAs('ana@gmail.com'), 'allowedEmails')));
  });

  it('Should let a member list the collection', async () => {
    await assertSucceeds(getDocs(collection(signedInAs('bruno@gmail.com'), 'allowedEmails')));
  });

  it('Should let a member with capital letters in the login list the collection', async () => {
    await assertSucceeds(getDocs(collection(signedInAs('Bruno@Gmail.com'), 'allowedEmails')));
  });

  it('Should not let a person outside the list list the collection', async () => {
    await assertFails(getDocs(collection(signedInAs('carla@gmail.com'), 'allowedEmails')));
  });

  it('Should not let a signed-out person list the collection', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(firestore, 'allowedEmails')));
  });

  it('Should not let a member with an unverified e-mail list the collection', async () => {
    await assertFails(getDocs(collection(signedInWithUnverifiedEmail('bruno@gmail.com'), 'allowedEmails')));
  });
});

describe('allowedEmails create', () => {
  const newPerson = { isAdmin: false, hasEntries: false };

  it('Should let the admin create a person without name and uid', async () => {
    await assertSucceeds(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let the admin create a person with a name', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, name: 'Carla' }));
  });

  it('Should not let the admin create a person with a uid', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, uid: 'uid-carla' }));
  });

  it('Should not let the admin create a person with an extra field', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, role: 'owner' }));
  });

  it('Should not let the admin create an admin', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, isAdmin: true }));
  });

  it('Should not let the admin create a person who already has entries', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'carla@gmail.com'), { ...newPerson, hasEntries: true }));
  });

  it('Should not let the admin create an entry whose id has capital letters', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'Carla@Gmail.com'), newPerson));
  });

  it('Should not let the admin create an entry whose id is not an e-mail', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'qualquer-coisa'), newPerson));
  });

  it('Should not let the admin overwrite an e-mail that is already in the list', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com'), newPerson));
  });

  it('Should not let a member create a person', async () => {
    await assertFails(setDoc(entryOf(signedInAs('bruno@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let a person outside the list create their own entry', async () => {
    await assertFails(setDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), newPerson));
  });

  it('Should not let a signed-out person create a person', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(setDoc(entryOf(firestore, 'carla@gmail.com'), newPerson));
  });

  it('Should not treat an admin with an unverified e-mail as an admin', async () => {
    await assertFails(setDoc(entryOf(signedInWithUnverifiedEmail('ana@gmail.com'), 'carla@gmail.com'), newPerson));
  });
});

describe('allowedEmails update', () => {
  it('Should let a member change their own name', async () => {
    await assertSucceeds(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  it('Should let the admin change their own name', async () => {
    await assertSucceeds(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { name: 'Ana Souza' }));
  });

  it('Should let a member change their own name when the login has capital letters', async () => {
    await assertSucceeds(updateDoc(entryOf(signedInAs('Bruno@Gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  describe('When the person has not entered yet', () => {
    beforeEach(async () => {
      await testEnvironment.withSecurityRulesDisabled(async (context) => {
        await setDoc(entryOf(context.firestore(), 'carla@gmail.com'), { isAdmin: false, hasEntries: false });
      });
    });

    it('Should let a person on the first entry set the name and their own uid', async () => {
      await assertSucceeds(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { name: 'Carla Lima', uid: 'uid-carla' }));
    });

    it('Should let the first entry happen with capital letters in the login', async () => {
      await assertSucceeds(updateDoc(entryOf(signedInAs('Carla@Gmail.com'), 'carla@gmail.com'), { name: 'Carla Lima', uid: 'uid-carla' }));
    });

    it('Should not let a person set the uid of another login', async () => {
      await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { name: 'Carla Lima', uid: 'uid-bruno' }));
    });

    it('Should not let a person set only the uid, without a name', async () => {
      await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { uid: 'uid-carla' }));
    });

    it('Should not let a person set the uid with an empty name', async () => {
      await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { name: '', uid: 'uid-carla' }));
    });

    it('Should not let a person set the uid with a name of 61 characters', async () => {
      await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { name: 'a'.repeat(61), uid: 'uid-carla' }));
    });

    it('Should not let a person set a uid that is not a string', async () => {
      await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'carla@gmail.com'), { name: 'Carla Lima', uid: 42 }));
    });
  });

  it('Should let a person with no uid yet change their name', async () => {
    await assertSucceeds(updateDoc(entryOf(signedInAs('davi@gmail.com'), 'davi@gmail.com'), { name: 'Davi S.' }));
  });

  it('Should not let a person replace a uid already saved', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com', 'uid-other'), 'bruno@gmail.com'), { name: 'Bruno S.', uid: 'uid-other' }));
  });

  it('Should not let a member change their own name to an empty one', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: '' }));
  });

  it('Should not let a member change their own name to only spaces', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: '   ' }));
  });

  it('Should not let a member change their own name to something that is not a string', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 42 }));
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: null }));
  });

  it('Should let a member change their own name to one of 60 characters', async () => {
    await assertSucceeds(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'a'.repeat(60) }));
  });

  it('Should not let a member change their own name to one of 61 characters', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'a'.repeat(61) }));
  });

  it('Should not let a member change their own name along with another field', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.', role: 'owner' }));
  });

  it('Should not let a member promote themselves', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { isAdmin: true }));
  });

  it('Should not let a member promote themselves while changing their name', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.', isAdmin: true }));
  });

  it('Should not let a member change their own hasEntries', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('davi@gmail.com'), 'davi@gmail.com'), { hasEntries: false }));
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.', hasEntries: true }));
  });

  it('Should not let a member change their own uid', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { uid: 'uid-other' }));
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.', uid: 'uid-other' }));
  });

  it('Should not let the admin change their own isAdmin, hasEntries or uid', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { isAdmin: false }));
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { hasEntries: true }));
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { uid: 'uid-other' }));
  });

  it('Should not let the admin change their own name to an empty one or to only spaces', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { name: '' }));
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { name: '   ' }));
  });

  it('Should not let a member change the name of another person', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('bruno@gmail.com'), 'davi@gmail.com'), { name: 'Davi S.' }));
  });

  it('Should not let the admin change the name of another person', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  it('Should not let the admin promote another person', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'bruno@gmail.com'), { isAdmin: true }));
  });

  it('Should not let the admin clear hasEntries of a person who has entries', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('ana@gmail.com'), 'davi@gmail.com'), { hasEntries: false }));
  });

  it('Should not let a person outside the list change a name', async () => {
    await assertFails(updateDoc(entryOf(signedInAs('carla@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  it('Should not let a signed-out person change a name', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(updateDoc(entryOf(firestore, 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  it('Should not let a member with an unverified e-mail change their own name', async () => {
    await assertFails(updateDoc(entryOf(signedInWithUnverifiedEmail('bruno@gmail.com'), 'bruno@gmail.com'), { name: 'Bruno S.' }));
  });

  it('Should not let a person write to the list', async () => {
    await assertFails(setDoc(entryOf(signedInAs('ana@gmail.com'), 'ana@gmail.com'), { isAdmin: true }));
  });
});

describe('allowedEmails delete', () => {
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

  it('Should not let a person outside the list delete a person', async () => {
    await assertFails(deleteDoc(entryOf(signedInAs('carla@gmail.com'), 'bruno@gmail.com')));
  });

  it('Should not let a signed-out person delete a person', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(deleteDoc(entryOf(firestore, 'bruno@gmail.com')));
  });

  it('Should not treat an admin with an unverified e-mail as an admin', async () => {
    await assertFails(deleteDoc(entryOf(signedInWithUnverifiedEmail('ana@gmail.com'), 'bruno@gmail.com')));
  });
});
