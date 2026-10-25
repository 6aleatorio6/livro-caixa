import { describe } from 'node:test';

import { OUTSIDERS, addOneOffBillBatch, asOwner, assertAccess, entryOf, itEach, oneOffBillOf, receiptFileOf, signedInAs } from './setup.mjs';
import { setDoc } from 'firebase/firestore';

const bruno = () => signedInAs('bruno@gmail.com');

/** Uma linha: `entry` e `file` trocam campos da conta e do registro; `batch` troca o resto do lote. */
function row(title, isAllowed, { entry = {}, file = {}, batch = {}, as = bruno, arrange } = {}) {
  return { title, isAllowed, as, arrange, batch: { entry: oneOffBillOf(entry), file: receiptFileOf(entry.receiptFileId ?? 'f1', file), ...batch } };
}

async function run({ as, arrange, batch, isAllowed }) {
  if (arrange) await asOwner(arrange);
  return assertAccess(isAllowed, addOneOffBillBatch(as(), batch));
}

describe('entries create by profile', () => {
  const ana = () => signedInAs('ana@gmail.com');
  const cases = [
    row('Should let a member create a one-off bill', true),
    row('Should let the admin create a one-off bill of their own', true, {
      as: ana,
      entry: { paidBy: 'uid-ana' },
      file: { uploadedBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
    ...OUTSIDERS.map(({ who, as }) => row(`Should not let ${who} create a one-off bill`, false, { as })),
  ];

  itEach(cases, run);
});

// Em cada linha, o lote é o do Bruno com os campos trocados: o que a linha troca é o que ela prova.
describe('entries create by a member', () => {
  const cases = [
    row('Should let a member create a one-off bill without a tag', true, { entry: { tagId: undefined } }),
    row('Should not let a member create a one-off bill paid by another person', false, { entry: { paidBy: 'uid-ana' } }),
    row('Should not let the admin create a one-off bill paid by another person', false, {
      as: () => signedInAs('ana@gmail.com'),
      entry: { paidBy: 'uid-bruno' },
      file: { uploadedBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
    row('Should not let a member create a one-off bill without the file record in the batch', false, { batch: { file: null } }),
    row('Should not let a member create a one-off bill with a file record uploaded by another person', false, { file: { uploadedBy: 'uid-ana' } }),
    row('Should not let a member create a one-off bill pointing to a file that already existed', false, {
      entry: { receiptFileId: 'fbruno1' },
      file: { storagePath: 'files/fbruno1' },
    }),
    row('Should not let a member create a one-off bill without marking hasEntries at the end of the batch', false, { batch: { markHasEntries: false } }),
    row('Should let a member who already has hasEntries create a one-off bill with the update in the batch', true, {
      arrange: (firestore) => setDoc(entryOf(firestore, 'bruno@gmail.com'), { name: 'Bruno', uid: 'uid-bruno', isAdmin: false, hasEntries: true }),
    }),
    row('Should not let a member create a one-off bill with a month different from the date', false, { entry: { month: '2026-10' } }),
    row('Should not let a member create a one-off bill with a createdAt that is not the server time', false, { entry: { createdAt: new Date() } }),
    row('Should not let a member create a one-off bill of the kind recurringPayment', false, { entry: { kind: 'recurringPayment' } }),
    row('Should not let a member create a one-off bill with the id of a recurring payment', false, { batch: { entryId: '2026-10_internet' } }),
    row('Should not let a member create a one-off bill of an unknown kind', false, { entry: { kind: 'other' } }),
    row('Should not let a member create a one-off bill with a key besides the nine', false, { entry: { note: 'a mais' } }),
    ...['kind', 'month', 'name', 'amountCents', 'date', 'paidBy', 'createdAt', 'receiptFileId'].map((key) =>
      row(`Should not let a member create a one-off bill without ${key}`, false, {
        entry: { [key]: undefined },
        batch: key === 'receiptFileId' ? { fileId: 'f1' } : {},
      }),
    ),
    row('Should not let a member create a one-off bill with an empty name', false, { entry: { name: '' } }),
    row('Should not let a member create a one-off bill with a name of only spaces', false, { entry: { name: '   ' } }),
    row('Should not let a member create a one-off bill with a name of 61 characters', false, { entry: { name: 'a'.repeat(61) } }),
    row('Should let a member create a one-off bill with a name of 60 characters', true, { entry: { name: 'a'.repeat(60) } }),
    row('Should not let a member create a one-off bill with amountCents zero', false, { entry: { amountCents: 0 } }),
    row('Should not let a member create a one-off bill with amountCents above the limit', false, { entry: { amountCents: 1000000000 } }),
    row('Should not let a member create a one-off bill with a fractional amountCents', false, { entry: { amountCents: 10.5 } }),
    row('Should not let a member create a one-off bill with amountCents as a text', false, { entry: { amountCents: '35000' } }),
    row('Should let a member create a one-off bill with amountCents 1', true, { entry: { amountCents: 1 } }),
    row('Should let a member create a one-off bill with amountCents at the limit', true, { entry: { amountCents: 999999999 } }),
    row('Should not let a member create a one-off bill with a date in month 13', false, { entry: { date: '2026-13-01', month: '2026-13' } }),
    row('Should not let a member create a one-off bill with a date on day 32', false, { entry: { date: '2026-09-32' } }),
    row('Should not let a member create a one-off bill with a date as dd/mm/yyyy', false, { entry: { date: '30/09/2026', month: '09/2026' } }),
    row('Should not let a member create a one-off bill with a tagId that is a number', false, { entry: { tagId: 42 } }),
  ];

  itEach(cases, run);
});
