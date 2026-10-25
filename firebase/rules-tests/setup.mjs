import { readFileSync } from 'node:fs';
import { after, before, beforeEach, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, setDoc } from 'firebase/firestore';

// O ambiente dos testes das regras: cada arquivo `*.test.mjs` importa este módulo, que liga o emulador
// do Firestore (`pnpm test:rules`, no PC, que tem o Java) e semeia a lista antes de cada caso. Os
// arquivos limpam o mesmo emulador a cada caso, então não rodam em paralelo (`--test-concurrency=1`).
let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-livro-caixa',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
  });
});

// Ana (admin) e Bruno (membro) já entraram, então têm o `uid` do login gravado; Davi (membro com
// lançamentos) está na lista e ainda não entrou, sem `uid`. Carla não está. Os documentos de
// `settings/tags` (uma tag, Casa) e de `recurringBills/internet` ficam semeados para os casos de
// leitura, de mudança e de exclusão.
beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await asOwner(async (firestore) => {
    await setDoc(entryOf(firestore, 'ana@gmail.com'), { name: 'Ana', uid: 'uid-ana', isAdmin: true, hasEntries: false });
    await setDoc(entryOf(firestore, 'bruno@gmail.com'), { name: 'Bruno', uid: 'uid-bruno', isAdmin: false, hasEntries: false });
    await setDoc(entryOf(firestore, 'davi@gmail.com'), { name: 'Davi', isAdmin: false, hasEntries: true });
    await setDoc(tagsDocOf(firestore), { items: { t1: { ...SEEDED_TAG } } });
    await setDoc(recurringBillOf(firestore, 'internet'), { ...SEEDED_BILL });
  });
});

after(() => testEnvironment.cleanup());

// O `uid` do login é o da pessoa (`uid-ana` para ana@gmail.com), a não ser que o teste dê outro.
function uidOf(email) {
  return `uid-${email.split('@')[0].toLowerCase()}`;
}

export function signedInAs(email, uid = uidOf(email)) {
  return testEnvironment.authenticatedContext(uid, { email, email_verified: true }).firestore();
}

export function signedInWithUnverifiedEmail(email) {
  return testEnvironment.authenticatedContext(uidOf(email), { email, email_verified: false }).firestore();
}

export function signedOut() {
  return testEnvironment.unauthenticatedContext().firestore();
}

export const entryOf = (firestore, email) => doc(firestore, 'allowedEmails', email);

export const tagsDocOf = (firestore) => doc(firestore, 'settings', 'tags');

export const settingsDocOf = (firestore, id) => doc(firestore, 'settings', id);

export const recurringBillOf = (firestore, id) => doc(firestore, 'recurringBills', id);

export const recurringBillsOf = (firestore) => collection(firestore, 'recurringBills');

/** A tag semeada em `settings/tags`, com a chave `t1`. */
export const SEEDED_TAG = { name: 'Casa', nameKey: 'casa', color: 'wood' };

/** A conta recorrente semeada com o id `internet`. */
export const SEEDED_BILL = { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01', tagId: 't1' };

/** Quem está fora: sem sessão, com o e-mail não verificado ou fora da lista. Tudo é recusado. */
export const OUTSIDERS = [
  { who: 'a signed-out person', as: () => signedOut() },
  { who: 'a person with an unverified e-mail', as: () => signedInWithUnverifiedEmail('bruno@gmail.com') },
  { who: 'a person outside the list', as: () => signedInAs('carla@gmail.com') },
];

/** Quem está na lista: Bruno (membro) e Ana (admin). */
export const MEMBERS = [
  { who: 'a member', as: () => signedInAs('bruno@gmail.com') },
  { who: 'the admin', as: () => signedInAs('ana@gmail.com') },
];

/**
 * Uma linha por perfil para a mesma operação: `action` completa o título ("read the tags") e `rest`
 * são os campos que a linha carrega (`data`, `id`).
 */
export function rowsFor(profiles, action, isAllowed, rest = {}) {
  return profiles.map(({ who, as }) => ({ title: `Should${isAllowed ? '' : ' not'} let ${who} ${action}`, as, isAllowed, ...rest }));
}

/** Grava ou muda a lista por fora das regras, como quem administra pelo console. */
export function asOwner(write) {
  return testEnvironment.withSecurityRulesDisabled((context) => write(context.firestore()));
}

/** O caso é liberado (`true`) ou recusado (`false`) pelas regras. */
export function assertAccess(isAllowed, operation) {
  return isAllowed ? assertSucceeds(operation) : assertFails(operation);
}

/**
 * Um `it` por linha da tabela: o `node:test` não tem `it.each`. O título de cada linha diz o que ela
 * prova, e `run` recebe a linha.
 */
export function itEach(rows, run) {
  for (const row of rows) it(row.title, () => run(row));
}
