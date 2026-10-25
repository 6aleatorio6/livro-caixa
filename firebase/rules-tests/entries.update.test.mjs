import { describe } from 'node:test';

import { deleteDoc, deleteField, serverTimestamp, updateDoc } from 'firebase/firestore';

import { SEEDED_RECEIPT_OF, asOwner, assertAccess, entryDocOf, entryRowsFor, fileOf, itEach, receiptFileOf, replaceReceiptBatch, signedInAs } from './setup.mjs';

const bruno = () => signedInAs('bruno@gmail.com');

const ONE_OFF_IDS = { own: 'bruno1', other: 'ana1' };
const PAYMENT_IDS = { own: '2026-10_luz', other: '2026-10_aluguel' };

// A troca do comprovante de `id`: o registro novo (do Bruno, nascido no lote), o lançamento apontando para ele e
// o registro antigo apagado.
const replaceReceipt = (as, id, changes = {}, options = {}) =>
  replaceReceiptBatch(as(), { entryId: id, oldFileId: SEEDED_RECEIPT_OF[id], newFileId: 'fnew', changes, ...options });

// Só o autor muda; o outro membro, o admin e quem está fora são recusados, em cada tipo de lançamento.
describe('entries update by profile, one-off bill', () => {
  itEach(entryRowsFor('change', { data: { name: 'Geladeira nova' } }, ONE_OFF_IDS), ({ as, id, data, isAllowed }) =>
    assertAccess(isAllowed, updateDoc(entryDocOf(as(), id), data)),
  );
});

describe('entries update by profile, recurring payment', () => {
  itEach(entryRowsFor('change the amount of', { data: { amountCents: 5000 } }, PAYMENT_IDS), ({ as, id, data, isAllowed }) =>
    assertAccess(isAllowed, updateDoc(entryDocOf(as(), id), data)),
  );
});

describe('entries update receipt replacement by profile, one-off bill', () => {
  itEach(entryRowsFor('replace the receipt of', {}, ONE_OFF_IDS), ({ as, id, isAllowed }) => assertAccess(isAllowed, replaceReceipt(as, id)));
});

describe('entries update receipt replacement by profile, recurring payment', () => {
  itEach(entryRowsFor('replace the receipt of', {}, PAYMENT_IDS), ({ as, id, isAllowed }) => assertAccess(isAllowed, replaceReceipt(as, id)));
});

// Em cada linha, `data` são os campos que o autor (Bruno) tenta mudar na conta avulsa dele.
describe('entries update by the author, one-off bill', () => {
  const cases = [
    { title: 'Should let the author change the name', data: { name: 'Geladeira nova' }, isAllowed: true },
    { title: 'Should let the author change the amount', data: { amountCents: 40000 }, isAllowed: true },
    { title: 'Should let the author change the tag', data: { tagId: 't2' }, isAllowed: true },
    { title: 'Should let the author remove the tag', data: { tagId: deleteField() }, isAllowed: true },
    { title: 'Should let the author change the date together with the month', data: { date: '2026-10-05', month: '2026-10' }, isAllowed: true },
    { title: 'Should let the author change the date inside the same month', data: { date: '2026-09-01' }, isAllowed: true },
    { title: 'Should not let the author change the date to another month without the month', data: { date: '2026-10-05' }, isAllowed: false },
    { title: 'Should not let the author change the date to a future month', data: { date: '2099-12-31', month: '2099-12' }, isAllowed: false },
    { title: 'Should not let the author change paidBy', data: { paidBy: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let the author change the kind', data: { kind: 'recurringPayment' }, isAllowed: false },
    { title: 'Should not let the author change createdAt', data: { createdAt: serverTimestamp() }, isAllowed: false },
    { title: 'Should not let the author point receiptFileId to another record without a batch', data: { receiptFileId: 'f2' }, isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryDocOf(bruno(), 'bruno1'), data)));
});

describe('entries update receipt replacement by the author, one-off bill', () => {
  const cases = [
    { title: 'Should let the author replace the receipt alone', run: () => replaceReceipt(bruno, 'bruno1'), isAllowed: true },
    { title: 'Should let the author replace the receipt together with the name', run: () => replaceReceipt(bruno, 'bruno1', { name: 'Geladeira nova' }), isAllowed: true },
    {
      title: 'Should not let the author point receiptFileId to a record that existed before the batch',
      run: () => replaceReceipt(bruno, 'bruno1', {}, { newFileId: 'fpbruno', newFile: null }),
      isAllowed: false,
    },
    { title: 'Should not let the author replace the receipt without deleting the old record', run: () => replaceReceipt(bruno, 'bruno1', {}, { oldFileId: null }), isAllowed: false },
    {
      title: 'Should not let the author replace the receipt with a record of another person',
      run: () => replaceReceipt(bruno, 'bruno1', {}, { newFile: receiptFileOf('fnew', { uploadedBy: 'uid-ana' }) }),
      isAllowed: false,
    },
  ];

  itEach(cases, ({ run, isAllowed }) => assertAccess(isAllowed, run()));
});

// No pagamento o autor só muda o valor e o comprovante: o resto vem da conta recorrente.
describe('entries update by the author, recurring payment', () => {
  const cases = [
    { title: 'Should let the author change the amount of the payment', data: { amountCents: 5000 }, isAllowed: true },
    { title: 'Should not let the author change the amount of the payment to zero', data: { amountCents: 0 }, isAllowed: false },
    { title: 'Should not let the author change the amount of the payment to a negative value', data: { amountCents: -100 }, isAllowed: false },
    { title: 'Should not let the author change the amount of the payment to a fractional value', data: { amountCents: 50.5 }, isAllowed: false },
    { title: 'Should not let the author change the amount of the payment to a text', data: { amountCents: '5000' }, isAllowed: false },
    { title: 'Should not let the author change the name of the payment', data: { name: 'Outro nome' }, isAllowed: false },
    { title: 'Should not let the author change the month of the payment', data: { month: '2026-09' }, isAllowed: false },
    { title: 'Should not let the author change the recurringBillId of the payment', data: { recurringBillId: 'internet' }, isAllowed: false },
    { title: 'Should not let the author change the dueDay of the payment', data: { dueDay: 20 }, isAllowed: false },
    { title: 'Should not let the author change the expectedAmountCents of the payment', data: { expectedAmountCents: 5000 }, isAllowed: false },
    { title: 'Should not let the author change the tag of the payment', data: { tagId: 't2' }, isAllowed: false },
    { title: 'Should not let the author change paidBy of the payment', data: { paidBy: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let the author change createdAt of the payment', data: { createdAt: serverTimestamp() }, isAllowed: false },
    { title: 'Should not let the author change the kind of the payment', data: { kind: 'oneOffBill' }, isAllowed: false },
    { title: 'Should not let the author add a date to the payment', data: { date: '2026-10-05' }, isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryDocOf(bruno(), '2026-10_luz'), data)));
});

describe('entries update receipt replacement by the author, recurring payment', () => {
  const id = '2026-10_luz';
  const cases = [
    { title: 'Should let the author replace the receipt of the payment alone', run: () => replaceReceipt(bruno, id), isAllowed: true },
    { title: 'Should let the author replace the receipt of the payment together with the amount', run: () => replaceReceipt(bruno, id, { amountCents: 5000 }), isAllowed: true },
    {
      title: 'Should not let the author point the payment receiptFileId to a record that existed before the batch',
      run: () => replaceReceipt(bruno, id, {}, { newFileId: 'fbruno1', newFile: null }),
      isAllowed: false,
    },
    { title: 'Should not let the author replace the receipt of the payment without deleting the old record', run: () => replaceReceipt(bruno, id, {}, { oldFileId: null }), isAllowed: false },
    { title: 'Should not let the author replace the receipt of the payment together with the name', run: () => replaceReceipt(bruno, id, { name: 'Outro nome' }), isAllowed: false },
  ];

  itEach(cases, ({ run, isAllowed }) => assertAccess(isAllowed, run()));
});

// A troca do comprovante de quem ficou sem o registro antigo (apagado por fora): o `delete` dele não pode derrubar o lote.
describe('entries update receipt replacement when the old file record is already gone', () => {
  const cases = [
    { title: 'Should let the author replace the receipt of a one-off bill whose old file record is gone', id: 'bruno1' },
    { title: 'Should let the author replace the receipt of a recurring payment whose old file record is gone', id: '2026-10_luz' },
  ];

  itEach(cases, async ({ id }) => {
    await asOwner((firestore) => deleteDoc(fileOf(firestore, SEEDED_RECEIPT_OF[id])));
    return assertAccess(true, replaceReceipt(bruno, id));
  });
});
