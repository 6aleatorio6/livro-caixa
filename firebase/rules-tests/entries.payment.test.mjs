import { describe } from 'node:test';

import { OUTSIDERS, addPaymentBatch, asOwner, assertAccess, itEach, receiptFileOf, recurringPaymentOf, signedInAs } from './setup.mjs';

const bruno = () => signedInAs('bruno@gmail.com');
const ana = () => signedInAs('ana@gmail.com');

/** Uma linha: `entry` e `file` trocam campos do pagamento e do registro; `batch` troca o resto do lote. */
function row(title, isAllowed, { entry = {}, file = {}, batch = {}, as = bruno, arrange } = {}) {
  return { title, isAllowed, as, arrange, batch: { entry: recurringPaymentOf(entry), file: receiptFileOf(entry.receiptFileId ?? 'f1', file), ...batch } };
}

async function run({ as, arrange, batch, isAllowed }) {
  if (arrange) await asOwner(arrange);
  return assertAccess(isAllowed, addPaymentBatch(as(), batch));
}

describe('recurringPayment create by profile', () => {
  const cases = [
    row('Should let a member create a recurring payment', true),
    row('Should let the admin create a recurring payment of their own', true, {
      as: ana,
      entry: { paidBy: 'uid-ana' },
      file: { uploadedBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
    ...OUTSIDERS.map(({ who, as }) => row(`Should not let ${who} create a recurring payment`, false, { as })),
  ];

  itEach(cases, run);
});

// Em cada linha, o lote é o do Bruno com os campos trocados: o que a linha troca é o que ela prova.
describe('recurringPayment create by a member', () => {
  const cases = [
    row('Should let a member create a recurring payment without a tag', true, { entry: { tagId: undefined } }),
    row('Should not let a member create a recurring payment with an id different from month_recurringBillId', false, { batch: { entryId: '2026-10_outra' } }),
    row('Should not let a member create a recurring payment with the id of another month', false, { batch: { entryId: '2026-09_internet' } }),
    row('Should not let a member create a recurring payment paid by another person', false, { entry: { paidBy: 'uid-ana' } }),
    row('Should not let a member create a recurring payment without the file record in the batch', false, { batch: { file: null } }),
    row('Should not let a member create a recurring payment with a file record uploaded by another person', false, { file: { uploadedBy: 'uid-ana' } }),
    row('Should not let a member create a recurring payment pointing to a file that already existed', false, {
      entry: { receiptFileId: 'fbruno1' },
      file: { storagePath: 'files/fbruno1' },
    }),
    row('Should not let a member create a recurring payment without marking hasEntries at the end of the batch', false, { batch: { markHasEntries: false } }),
    row('Should not let a member create a recurring payment with a createdAt that is not the server time', false, { entry: { createdAt: new Date() } }),
    row('Should not let a member create a recurring payment with month 2026-13', false, { entry: { month: '2026-13' }, batch: { entryId: '2026-13_internet' } }),
    row('Should not let a member create a recurring payment with month 2026-9', false, { entry: { month: '2026-9' }, batch: { entryId: '2026-9_internet' } }),
    row('Should not let a member create a recurring payment with a date', false, { entry: { date: '2026-10-15' } }),
    row('Should not let a member create a recurring payment with a key besides the eleven', false, { entry: { note: 'a mais' } }),
    row('Should not let a member create a recurring payment of the kind oneOffBill', false, { entry: { kind: 'oneOffBill' } }),
    ...['kind', 'month', 'recurringBillId', 'name', 'amountCents', 'dueDay', 'expectedAmountCents', 'paidBy', 'createdAt', 'receiptFileId'].map((key) =>
      row(`Should not let a member create a recurring payment without ${key}`, false, {
        entry: { [key]: undefined },
        batch: key === 'receiptFileId' ? { fileId: 'f1' } : key === 'month' || key === 'recurringBillId' ? { entryId: '2026-10_internet' } : {},
      }),
    ),
    row('Should not let a member create a recurring payment with an empty name', false, { entry: { name: '' } }),
    row('Should not let a member create a recurring payment with a name of 61 characters', false, { entry: { name: 'a'.repeat(61) } }),
    row('Should let a member create a recurring payment with a name of 60 characters', true, { entry: { name: 'a'.repeat(60) } }),
    row('Should not let a member create a recurring payment with amountCents zero', false, { entry: { amountCents: 0 } }),
    row('Should not let a member create a recurring payment with amountCents above the limit', false, { entry: { amountCents: 1000000000 } }),
    row('Should not let a member create a recurring payment with a fractional amountCents', false, { entry: { amountCents: 10.5 } }),
    row('Should let a member create a recurring payment with amountCents 1', true, { entry: { amountCents: 1 } }),
    row('Should let a member create a recurring payment with amountCents at the limit', true, { entry: { amountCents: 999999999 } }),
    row('Should not let a member create a recurring payment with dueDay zero', false, { entry: { dueDay: 0 } }),
    row('Should not let a member create a recurring payment with dueDay 32', false, { entry: { dueDay: 32 } }),
    row('Should not let a member create a recurring payment with a fractional dueDay', false, { entry: { dueDay: 10.5 } }),
    row('Should not let a member create a recurring payment with dueDay as a text', false, { entry: { dueDay: '15' } }),
    row('Should let a member create a recurring payment with dueDay 1', true, { entry: { dueDay: 1 } }),
    row('Should let a member create a recurring payment with dueDay 31', true, { entry: { dueDay: 31 } }),
    row('Should not let a member create a recurring payment with expectedAmountCents zero', false, { entry: { expectedAmountCents: 0 } }),
    row('Should not let a member create a recurring payment with expectedAmountCents above the limit', false, { entry: { expectedAmountCents: 1000000000 } }),
    row('Should not let a member create a recurring payment with a fractional expectedAmountCents', false, { entry: { expectedAmountCents: 10.5 } }),
    row('Should let a member create a recurring payment with expectedAmountCents at the limit', true, { entry: { expectedAmountCents: 999999999 } }),
    row('Should not let a member create a recurring payment of a bill that does not exist', false, {
      entry: { recurringBillId: 'naoexiste' },
    }),
    row('Should not let a member create a recurring payment with an empty recurringBillId', false, {
      entry: { recurringBillId: '' },
      batch: { entryId: '2026-10_' },
    }),
    row('Should not let a member create a recurring payment of a future month', false, {
      entry: { month: '2030-01' },
      batch: { entryId: '2030-01_internet' },
    }),
    row('Should let a member create a recurring payment of a past month', true, {
      entry: { month: '2026-01' },
      batch: { entryId: '2026-01_internet' },
    }),
  ];

  itEach(cases, run);
});

// O documento do mês já existe (semeado), então a gravação do lote vira um `update`, que a regra recusa para
// qualquer pessoa, inclusive o autor. Cada linha paga a conta do outro (`aluguel` da Ana, `luz` do Bruno).
describe('recurringPayment second payment in the same month', () => {
  const rentOfAna = (extra = {}) => ({ entry: { recurringBillId: 'aluguel', name: 'Aluguel', ...extra.entry }, file: extra.file, batch: extra.batch });
  const cases = [
    row('Should not let the other member pay a bill already paid in the month', false, rentOfAna()),
    row('Should not let the admin pay a bill already paid in the month by a member', false, {
      as: ana,
      entry: { recurringBillId: 'luz', name: 'Luz', paidBy: 'uid-ana' },
      file: { uploadedBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
    row('Should not let the author pay a bill already paid by themselves in the month', false, {
      entry: { recurringBillId: 'luz', name: 'Luz' },
    }),
    row('Should not let the admin author pay a bill already paid by themselves in the month', false, {
      as: ana,
      entry: { recurringBillId: 'aluguel', name: 'Aluguel', paidBy: 'uid-ana' },
      file: { uploadedBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
  ];

  itEach(cases, run);
});
