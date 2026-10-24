import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  await testEnvironment.withSecurityRulesDisabled((context) =>
    setDoc(doc(context.firestore(), 'allowedEmails', 'ana@gmail.com'), { isAdmin: false, hasEntries: false }),
  );
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
