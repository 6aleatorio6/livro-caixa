import { describe } from 'node:test';

import { deleteField, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import {
  OUTSIDERS,
  addContributionBatch,
  addPaymentBatch,
  asOwner,
  assertAccess,
  contributionOf,
  deleteEntryBatch,
  entryDocOf,
  itEach,
  monthFromNow,
  paymentToContributionBatch,
  receiptFileOf,
  recurringPaymentOf,
  replaceReceiptBatch,
  seedReceipt,
  signedInAs,
  takeOwnershipBatch,
  unownedPaymentOf,
} from './setup/index.mjs';

const bruno = () => signedInAs('bruno@gmail.com');
const ana = () => signedInAs('ana@gmail.com');

// Além da semente comum: a internet de 2026-10 com o pagamento sem dono e a contribuição da Ana (`cana`), e a
// contribuição do Bruno no aluguel pago pela Ana (`cbruno`), cada uma com o comprovante dela.
async function seedContributions(firestore) {
  await setDoc(entryDocOf(firestore, '2026-10_internet'), unownedPaymentOf());
  await seedReceipt(firestore, 'fcana', { uploadedBy: 'uid-ana' });
  await setDoc(entryDocOf(firestore, 'cana'), contributionOf({ entryId: '2026-10_internet', paidBy: 'uid-ana', amountCents: 5000, receiptFileId: 'fcana' }));
  await seedReceipt(firestore, 'fcbruno');
  await setDoc(entryDocOf(firestore, 'cbruno'), contributionOf({ receiptFileId: 'fcbruno' }));
}

/** Uma linha: `entry` e `file` trocam campos da contribuição e do registro; `batch` troca o resto do lote. */
function row(title, isAllowed, { entry = {}, file = {}, batch = {}, as = bruno, arrange } = {}) {
  return { title, isAllowed, as, arrange, batch: { entry: contributionOf(entry), file: receiptFileOf(file), ...batch } };
}

async function run({ as, arrange, batch, isAllowed }) {
  if (arrange) await asOwner(arrange);
  return assertAccess(isAllowed, addContributionBatch(as(), batch));
}

describe('contribution create', () => {
  const cases = [
    row("Should let a member contribute to another member's payment", true),
    row("Should let a member contribute to another member's one-off bill", true, { entry: { entryId: 'ana1', month: '2026-09' } }),
    row('Should let a member contribute to a month with no payment, writing the unowned payment in the same batch', true, {
      entry: { entryId: '2026-10_internet' },
      batch: { unownedPayment: unownedPaymentOf() },
    }),
    row('Should let a member contribute to the next month with no payment, writing the unowned payment in the same batch', true, {
      entry: { entryId: `${monthFromNow(1)}_internet`, month: monthFromNow(1) },
      batch: { unownedPayment: unownedPaymentOf({ month: monthFromNow(1) }) },
    }),
    row('Should let a member contribute to a month with an unowned payment', true, {
      entry: { entryId: '2026-10_internet' },
      arrange: seedContributions,
    }),
    row("Should not let a member contribute in another member's name", false, { entry: { paidBy: 'uid-ana' } }),
    row('Should not let a member contribute without the file record in the batch', false, { batch: { file: null } }),
    row('Should not let a member contribute pointing to a file that already existed', false, { entry: { receiptFileId: 'fbruno1' }, batch: { file: null } }),
    row('Should not let a member contribute with a file record uploaded by another person', false, { file: { uploadedBy: 'uid-ana' } }),
    row('Should not let a member contribute without marking hasEntries at the end of the batch', false, { batch: { markHasEntries: false } }),
    row('Should not let a member contribute with a createdAt that is not the server time', false, { entry: { createdAt: new Date() } }),
    row('Should not let a member contribute with the id shape of a payment', false, { batch: { entryId: '2026-10_x' } }),
    row('Should not let a member contribute with an entryId that does not exist at the end of the batch', false, { entry: { entryId: 'naoexiste' } }),
    row("Should not let a member contribute with a month other than the target's", false, { entry: { month: '2026-09' } }),
    row('Should not let a member contribute to another contribution', false, { entry: { entryId: 'cana' }, arrange: seedContributions }),
    row('Should not let a member contribute with a name', false, { entry: { name: 'Aluguel' } }),
    row('Should not let a member contribute with a key besides the seven', false, { entry: { note: 'a mais' } }),
    row('Should not let a member contribute with amountCents zero', false, { entry: { amountCents: 0 } }),
    row('Should not let a member contribute with a fractional amountCents', false, { entry: { amountCents: 10.5 } }),
    ...['kind', 'month', 'entryId', 'amountCents', 'paidBy', 'createdAt', 'receiptFileId'].map((key) =>
      row(`Should not let a member contribute without ${key}`, false, { entry: { [key]: undefined }, batch: key === 'receiptFileId' ? { fileId: 'f1' } : {} }),
    ),
    ...OUTSIDERS.map(({ who, as }) => row(`Should not let ${who} contribute`, false, { as })),
  ];

  itEach(cases, run);
});

// O pagamento sem dono nasce no lote da primeira contribuição, com o id e as regras de mês do pagamento.
describe('unowned payment create', () => {
  const firstContribution = (unowned, entry = {}) => ({ entry: { entryId: '2026-10_internet', ...entry }, batch: { unownedPayment: unownedPaymentOf(unowned) } });
  const cases = [
    row('Should not let a member write an unowned payment of a bill that does not exist', false, {
      ...firstContribution({ recurringBillId: 'naoexiste' }, { entryId: '2026-10_naoexiste' }),
    }),
    row('Should not let a member write an unowned payment of the month after the next', false, {
      ...firstContribution({ month: monthFromNow(2) }, { entryId: `${monthFromNow(2)}_internet`, month: monthFromNow(2) }),
    }),
    row('Should not let a member write an unowned payment with paidBy and without the amount', false, {
      ...firstContribution({ paidBy: 'uid-bruno' }),
    }),
    row('Should not let a member write an unowned payment with a createdAt that is not the server time', false, {
      ...firstContribution({ createdAt: new Date() }),
    }),
    row('Should not let a member write an unowned payment without the expected amount', false, {
      ...firstContribution({ expectedAmountCents: undefined }),
    }),
  ];

  itEach(cases, run);
});

describe('contribution update', () => {
  const cases = [
    { title: 'Should let the author change the amount of their contribution', as: bruno, data: { amountCents: 40000 }, isAllowed: true },
    { title: "Should not let a member change another member's contribution", as: ana, data: { amountCents: 40000 }, isAllowed: false },
    { title: 'Should not let the author change the entryId of their contribution', as: bruno, data: { entryId: '2026-10_internet' }, isAllowed: false },
    { title: 'Should not let the author change the month of their contribution', as: bruno, data: { month: '2026-09' }, isAllowed: false },
    { title: 'Should not let the author change paidBy of their contribution', as: bruno, data: { paidBy: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let the author change the amount of their contribution to zero', as: bruno, data: { amountCents: 0 }, isAllowed: false },
    ...OUTSIDERS.map(({ who, as }) => ({ title: `Should not let ${who} change a contribution`, as, data: { amountCents: 40000 }, isAllowed: false })),
  ];

  itEach(cases, async ({ as, data, isAllowed }) => {
    await asOwner(seedContributions);
    return assertAccess(isAllowed, updateDoc(entryDocOf(as(), 'cbruno'), data));
  });
});

describe('contribution receipt replacement', () => {
  const cases = [
    { title: 'Should let the author replace the receipt of their contribution', as: bruno, isAllowed: true },
    { title: "Should not let a member replace the receipt of another member's contribution", as: ana, newFile: receiptFileOf({ uploadedBy: 'uid-ana' }), isAllowed: false },
  ];

  itEach(cases, async ({ as, newFile = receiptFileOf(), isAllowed }) => {
    await asOwner(seedContributions);
    return assertAccess(isAllowed, replaceReceiptBatch(as(), { entryId: 'cbruno', oldFileId: 'fcbruno', newFileId: 'fnew', newFile }));
  });
});

describe('contribution and unowned payment delete', () => {
  const cases = [
    { title: 'Should let the author delete their contribution with its receipt', as: bruno, run: (as) => deleteEntryBatch(as, { entryId: 'cbruno', fileId: 'fcbruno' }), isAllowed: true },
    { title: "Should not let a member delete another member's contribution", as: ana, run: (as) => deleteEntryBatch(as, { entryId: 'cbruno', fileId: 'fcbruno' }), isAllowed: false },
    { title: 'Should not let the author delete their contribution keeping its receipt', as: bruno, run: (as) => deleteEntryBatch(as, { entryId: 'cbruno', fileId: null }), isAllowed: false },
    { title: 'Should let any member delete an unowned payment', as: bruno, run: (as) => deleteEntryBatch(as, { entryId: '2026-10_internet', fileId: null }), isAllowed: true },
    { title: 'Should let the admin delete an unowned payment', as: ana, run: (as) => deleteEntryBatch(as, { entryId: '2026-10_internet', fileId: null }), isAllowed: true },
    {
      title: 'Should let the author delete the last contribution together with the unowned payment',
      as: ana,
      run: async (as) => {
        await deleteEntryBatch(as, { entryId: 'cana', fileId: 'fcana' });
        return deleteEntryBatch(as, { entryId: '2026-10_internet', fileId: null });
      },
      isAllowed: true,
    },
    { title: 'Should not let a member delete an owned payment of another member', as: bruno, run: (as) => deleteEntryBatch(as, { entryId: '2026-10_aluguel', fileId: 'fpana' }), isAllowed: false },
    ...OUTSIDERS.map(({ who, as }) => ({ title: `Should not let ${who} delete an unowned payment`, as, run: (firestore) => deleteEntryBatch(firestore, { entryId: '2026-10_internet', fileId: null }), isAllowed: false })),
  ];

  itEach(cases, async ({ as, run: operation, isAllowed }) => {
    await asOwner(seedContributions);
    return assertAccess(isAllowed, operation(as()));
  });
});

// Pagar o mês com contribuições é preencher o dono do pagamento sem dono: o valor, o comprovante e a hora.
describe('unowned payment ownership', () => {
  const owner = (overrides = {}) => ({ paidBy: 'uid-bruno', amountCents: 11990, receiptFileId: 'fown', createdAt: serverTimestamp(), ...overrides });
  const removal = { paidBy: deleteField(), amountCents: deleteField(), receiptFileId: deleteField() };
  const cases = [
    { title: 'Should let a member take ownership of an unowned payment', run: () => takeOwnershipBatch(bruno(), { paymentId: '2026-10_internet', owner: owner() }), isAllowed: true },
    {
      title: "Should not let a member take ownership of an unowned payment in another member's name",
      run: () => takeOwnershipBatch(bruno(), { paymentId: '2026-10_internet', owner: owner({ paidBy: 'uid-ana' }) }),
      isAllowed: false,
    },
    {
      title: 'Should not let a member take ownership of an unowned payment without a receipt record',
      run: () => takeOwnershipBatch(bruno(), { paymentId: '2026-10_internet', owner: owner(), file: null }),
      isAllowed: false,
    },
    {
      title: 'Should not let a member take ownership of an unowned payment changing its name',
      run: () => takeOwnershipBatch(bruno(), { paymentId: '2026-10_internet', owner: owner({ name: 'Outra' }) }),
      isAllowed: false,
    },
    {
      title: "Should not let a member take ownership of another member's payment",
      run: () => takeOwnershipBatch(bruno(), { paymentId: '2026-10_aluguel', owner: owner() }),
      isAllowed: false,
    },
    {
      title: "Should not let a member remove the owner of another member's payment",
      run: () => updateDoc(entryDocOf(bruno(), '2026-10_aluguel'), removal),
      isAllowed: false,
    },
    {
      title: 'Should let the author turn their payment into an unowned one, with a contribution on the same receipt',
      run: () =>
        paymentToContributionBatch(bruno(), {
          paymentId: '2026-10_luz',
          removal,
          contributionId: 'cconv',
          contribution: contributionOf({ entryId: '2026-10_luz', amountCents: 11990, receiptFileId: 'fpbruno' }),
        }),
      isAllowed: true,
    },
    {
      title: 'Should not let the author turn their payment into a contribution on another receipt that already existed',
      run: () =>
        paymentToContributionBatch(bruno(), {
          paymentId: '2026-10_luz',
          removal,
          contributionId: 'cconv',
          contribution: contributionOf({ entryId: '2026-10_luz', amountCents: 11990, receiptFileId: 'fbruno1' }),
        }),
      isAllowed: false,
    },
    {
      title: 'Should let the author turn their contribution into the payment of the month, keeping its receipt',
      run: () =>
        takeOwnershipBatch(ana(), {
          paymentId: '2026-10_internet',
          owner: owner({ paidBy: 'uid-ana', receiptFileId: 'fcana' }),
          file: null,
          email: 'ana@gmail.com',
          deleteContributionId: 'cana',
        }),
      isAllowed: true,
    },
    {
      title: 'Should keep refusing a second payment of the same month',
      run: () => addPaymentBatch(bruno(), { entry: recurringPaymentOf({ recurringBillId: 'aluguel', name: 'Aluguel' }) }),
      isAllowed: false,
    },
  ];

  itEach(cases, async ({ run: operation, isAllowed }) => {
    await asOwner(seedContributions);
    return assertAccess(isAllowed, operation());
  });
});
