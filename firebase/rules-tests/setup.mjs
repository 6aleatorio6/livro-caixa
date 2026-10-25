import { readFileSync } from 'node:fs';
import { after, before, beforeEach, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';

// O ambiente dos testes das regras: cada arquivo `*.test.mjs` importa este módulo, que liga os emuladores
// do Firestore e do Storage (`pnpm test:rules`, no PC, que tem o Java) e semeia a lista antes de cada caso. Os
// arquivos limpam o mesmo emulador a cada caso, então não rodam em paralelo (`--test-concurrency=1`).
let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-livro-caixa',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
    storage: { rules: readFileSync('firebase/storage.rules', 'utf8') },
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
    // Uma conta avulsa de cada um, com o registro do comprovante, para `get`, `update` e `delete`.
    await setDoc(fileOf(firestore, 'fana1'), receiptFileOf('fana1', { uploadedBy: 'uid-ana' }));
    await setDoc(entryDocOf(firestore, 'ana1'), oneOffBillOf({ paidBy: 'uid-ana', receiptFileId: 'fana1' }));
    await setDoc(fileOf(firestore, 'fbruno1'), receiptFileOf('fbruno1'));
    await setDoc(entryDocOf(firestore, 'bruno1'), oneOffBillOf({ paidBy: 'uid-bruno', receiptFileId: 'fbruno1' }));
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

/** O Storage de quem entrou: a API compat, com `ref(caminho).put(bytes, { contentType })`. */
export function storageSignedInAs(email, uid = uidOf(email)) {
  return testEnvironment.authenticatedContext(uid, { email, email_verified: true }).storage();
}

/** O Storage de quem não entrou. */
export function storageSignedOut() {
  return testEnvironment.unauthenticatedContext().storage();
}

/** O Storage de quem entrou com o e-mail não verificado. */
export function storageSignedInWithUnverifiedEmail(email) {
  return testEnvironment.authenticatedContext(uidOf(email), { email, email_verified: false }).storage();
}

/** Grava um arquivo no Storage por fora das regras, para os casos de leitura, exclusão e sobrescrita. */
export function seedStorageFile(path, bytes, contentType) {
  return testEnvironment.withSecurityRulesDisabled((context) => context.storage().ref(path).put(bytes, { contentType }));
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

export const entryDocOf = (firestore, id) => doc(firestore, 'entries', id);

export const entriesOf = (firestore) => collection(firestore, 'entries');

export const fileOf = (firestore, id) => doc(firestore, 'files', id);

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

/** Quem está na lista, vista pelo Storage. */
export const STORAGE_MEMBERS = [
  { who: 'a member', as: () => storageSignedInAs('bruno@gmail.com') },
  { who: 'the admin', as: () => storageSignedInAs('ana@gmail.com') },
];

/** Quem está fora, vista pelo Storage: o Storage consulta a lista no Firestore, então um e-mail verificado fora dela não manda nada. */
export const STORAGE_OUTSIDERS = [
  { who: 'a signed-out person', as: () => storageSignedOut() },
  { who: 'a person with an unverified e-mail', as: () => storageSignedInWithUnverifiedEmail('bruno@gmail.com') },
  { who: 'a person outside the list', as: () => storageSignedInAs('carla@gmail.com') },
];

/**
 * Os perfis de `entries.update` e `entries.delete`: só o autor (Bruno) mexe no lançamento dele; outro membro
 * no do outro, o admin no de um membro e quem está fora são recusados. `rest` são os campos de cada linha.
 */
export function entryRowsFor(action, rest = {}) {
  const author = { who: 'the author', as: () => signedInAs('bruno@gmail.com') };
  const other = { who: 'a member, on the entry of another person,', as: () => signedInAs('bruno@gmail.com') };
  const admin = { who: 'the admin, on the entry of a member,', as: () => signedInAs('ana@gmail.com') };
  return [
    ...rowsFor([author], `${action} the entry`, true, { id: 'bruno1', ...rest }),
    ...rowsFor([other], `${action} the entry`, false, { id: 'ana1', ...rest }),
    ...rowsFor([admin], `${action} the entry`, false, { id: 'bruno1', ...rest }),
    ...rowsFor(OUTSIDERS, `${action} an entry`, false, { id: 'bruno1', ...rest }),
  ];
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

/**
 * A conta avulsa válida do Bruno, com os campos trocados em `overrides`. Um campo com `undefined` sai
 * do documento (o Firestore recusa `undefined`, e a regra olha as chaves que faltam).
 */
export function oneOffBillOf(overrides = {}) {
  const entry = {
    kind: 'oneOffBill',
    month: '2026-09',
    name: 'Conserto da geladeira',
    amountCents: 35000,
    date: '2026-09-30',
    tagId: 't1',
    paidBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    receiptFileId: 'f1',
    ...overrides,
  };
  for (const key of Object.keys(entry)) if (entry[key] === undefined) delete entry[key];
  return entry;
}

/** O registro do comprovante (uma imagem do Bruno), com os campos trocados em `overrides`. */
export function receiptFileOf(id, overrides = {}) {
  const file = { storagePath: `files/${id}`, type: 'image', contentType: 'image/webp', sizeBytes: 812345, uploadedBy: 'uid-bruno', ...overrides };
  for (const key of Object.keys(file)) if (file[key] === undefined) delete file[key];
  return file;
}

/**
 * O lote como o app grava: o registro do arquivo, o lançamento e o `hasEntries: true` de `email`.
 * `file: null` deixa o registro de fora, e `markHasEntries: false` deixa de fora o `hasEntries`.
 */
export function addOneOffBillBatch(firestore, { entryId = 'e1', entry = oneOffBillOf(), fileId = entry.receiptFileId, file = receiptFileOf(fileId), email = 'bruno@gmail.com', markHasEntries = true } = {}) {
  const batch = writeBatch(firestore);
  if (file !== null) batch.set(fileOf(firestore, fileId), file);
  batch.set(entryDocOf(firestore, entryId), entry);
  if (markHasEntries) batch.update(entryOf(firestore, email), { hasEntries: true });
  return batch.commit();
}
