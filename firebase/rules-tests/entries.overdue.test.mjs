import { describe, it } from 'node:test';

import { deleteField, setDoc, updateDoc } from 'firebase/firestore';

import {
  OUTSIDERS,
  SEEDED_BILL,
  addContributionBatch,
  addPaymentBatch,
  asOwner,
  assertAccess,
  overdueMonthDocOf,
  overdueMonthIdOf,
  contributionOf,
  deleteOverdueBatch,
  entryDocOf,
  itEach,
  monthFromNow,
  oneOffBillOf,
  overduePaymentOf,
  paidLaterOverdueMonthOf,
  payOverdueBatch,
  receiptFileOf,
  recurringBillOf,
  recurringPaymentOf,
  replaceReceiptBatch,
  seedOverduePayment,
  seedSkippedMonth,
  signedInAs,
  skippedOverdueMonthOf,
  unownedPaymentOf,
} from './setup/index.mjs';

const bruno = () => signedInAs('bruno@gmail.com');
const ana = () => signedInAs('ana@gmail.com');
const CURRENT = monthFromNow(0);
const PREVIOUS = monthFromNow(-1);

/**
 * Uma linha do lote do pagamento atrasado: `entry`, `file` e `overdueMonth` trocam campos do pagamento, do registro e
 * do `paidLater`; `batch` troca o resto do lote (`entry: null` e `overdueMonth: null` os deixam de fora).
 */
function row(title, isAllowed, { entry = {}, file = {}, overdueMonth = {}, batch = {}, as = bruno, arrange } = {}) {
  return {
    title,
    isAllowed,
    as,
    arrange,
    batch: {
      entry: overduePaymentOf(entry),
      file: receiptFileOf(file),
      overdueMonth: paidLaterOverdueMonthOf(overdueMonth),
      ...batch,
    },
  };
}

async function run({ as, arrange, batch, isAllowed }) {
  if (arrange) await asOwner(arrange);
  return assertAccess(isAllowed, payOverdueBatch(as(), batch));
}

describe('overduePayment create by profile', () => {
  const cases = [
    row('Should let a member pay an overdue bill', true),
    row('Should let the admin pay an overdue bill of their own', true, {
      as: ana,
      entry: { paidBy: 'uid-ana' },
      file: { uploadedBy: 'uid-ana' },
      overdueMonth: { createdBy: 'uid-ana' },
      batch: { email: 'ana@gmail.com' },
    }),
    ...OUTSIDERS.map(({ who, as }) => row(`Should not let ${who} pay an overdue bill`, false, { as })),
  ];

  itEach(cases, run);
});

// Em cada linha, o lote é o do Bruno com os campos trocados: o que a linha troca é o que ela prova.
describe('overduePayment create by a member', () => {
  const cases = [
    row('Should let a member pay an overdue bill without a tag', true, { entry: { tagId: undefined }, overdueMonth: { tagId: undefined } }),
    row('Should not let a member pay an overdue bill without the paid-later month in the batch', false, { batch: { overdueMonth: null } }),
    row('Should not let a member write the paid-later month without the payment in the batch', false, { batch: { entry: null } }),
    row('Should not let a member pay an overdue bill with a billMonth equal to the month', false, {
      entry: { billMonth: CURRENT },
      overdueMonth: { month: CURRENT },
    }),
    row('Should not let a member pay an overdue bill with a billMonth after the month', false, {
      entry: { billMonth: monthFromNow(1) },
      overdueMonth: { month: monthFromNow(1) },
    }),
    row('Should not let a member pay an overdue bill with an id shaped like a payment', false, {
      batch: { entryId: `${CURRENT}_internet` },
      overdueMonth: { entryId: `${CURRENT}_internet` },
    }),
    row('Should not let a member pay as overdue a month already paid in entries', false, {
      arrange: (firestore) => setDoc(entryDocOf(firestore, overdueMonthIdOf()), recurringPaymentOf({ month: PREVIOUS })),
    }),
    row('Should not let a member pay an overdue bill in a future month', false, { entry: { month: monthFromNow(1) } }),
    row('Should not let a member pay an overdue bill of a month before 2026-10', false, {
      entry: { billMonth: '2026-09' },
      overdueMonth: { month: '2026-09' },
    }),
    row('Should not let a member pay an overdue bill of a bill that does not exist', false, {
      entry: { recurringBillId: 'naoexiste' },
      overdueMonth: { recurringBillId: 'naoexiste' },
    }),
    row('Should not let a member pay an overdue bill paid by another person', false, { entry: { paidBy: 'uid-ana' } }),
    row('Should not let a member pay an overdue bill without the file record in the batch', false, { batch: { file: null } }),
    row('Should not let a member pay an overdue bill with a file record uploaded by another person', false, { file: { uploadedBy: 'uid-ana' } }),
    row('Should not let a member pay an overdue bill without marking hasEntries at the end of the batch', false, { batch: { markHasEntries: false } }),
    row('Should not let a member pay an overdue bill with a createdAt that is not the server time', false, { entry: { createdAt: new Date() } }),
    row('Should not let a member pay an overdue bill with a key besides the twelve', false, { entry: { note: 'a mais' } }),
    ...['billMonth', 'month', 'recurringBillId', 'name', 'amountCents', 'dueDay', 'expectedAmountCents', 'paidBy', 'createdAt', 'receiptFileId'].map((key) =>
      row(`Should not let a member pay an overdue bill without ${key}`, false, {
        entry: { [key]: undefined },
        batch: key === 'receiptFileId' ? { fileId: 'f1' } : {},
      }),
    ),
    row('Should not let a member pay an overdue bill with amountCents zero', false, { entry: { amountCents: 0 } }),
    row('Should let a member pay an overdue bill with an amountCents different from the expected', true, { entry: { amountCents: 5000 } }),
    row('Should not let a member pay an overdue bill with an empty name', false, { entry: { name: '' } }),
    row('Should not let a member pay an overdue bill with dueDay 32', false, { entry: { dueDay: 32 } }),
    row('Should not let a member pay an overdue bill of the kind recurringPayment', false, { entry: { kind: 'recurringPayment' } }),
    row('Should not let a member pay an overdue bill pointing the paid-later month to another entry', false, { overdueMonth: { entryId: 'o2' } }),
    row('Should not let a member pay an overdue bill with a paid-later month of another person', false, { overdueMonth: { createdBy: 'uid-ana' } }),
    row('Should not let a member point a paid-later month to a one-off bill', false, {
      batch: { entry: oneOffBillOf({ receiptFileId: 'f1' }), entryId: 'o1' },
    }),
    row('Should not let a member pay an overdue bill with a skipped month in the batch instead of the paid-later month', false, {
      batch: { overdueMonth: skippedOverdueMonthOf() },
    }),
    row('Should not let a member pay the same overdue bill twice in one batch', false, {
      batch: { extraEntries: [['o2', overduePaymentOf({ receiptFileId: 'f2' }), 'f2']] },
    }),
    row('Should not let a member write a paid-later month for a payment that already existed', false, {
      arrange: (firestore) => setDoc(entryDocOf(firestore, 'o1'), overduePaymentOf({ receiptFileId: 'f1' })),
      batch: { entry: null },
    }),
    // Dois `paidLater` apontando para o mesmo pagamento: o da conta paga satisfaz o pagamento, e o outro precisa ser
    // recusado por não ser da conta nem do mês do pagamento.
    row('Should not let a member write a second paid-later month of another bill pointing to the same payment', false, {
      arrange: (firestore) => setDoc(recurringBillOf(firestore, 'agua'), { ...SEEDED_BILL, name: 'Água' }),
      batch: { extraOverdueMonths: [[overdueMonthIdOf({ recurringBillId: 'agua' }), paidLaterOverdueMonthOf({ recurringBillId: 'agua', name: 'Água' })]] },
    }),
    row('Should not let a member write a second paid-later month of another month pointing to the same payment', false, {
      batch: { extraOverdueMonths: [[overdueMonthIdOf({ month: CURRENT }), paidLaterOverdueMonthOf({ month: CURRENT })]] },
    }),
  ];

  itEach(cases, run);
});

// O mês pulado vira pago depois no lote do pagamento, com um `update` do `overdueMonths`.
describe('overduePayment payment of a skipped month', () => {
  const cases = [
    row('Should let a member pay a skipped month', true, { arrange: seedSkippedMonth, batch: { updateOverdueMonth: true } }),
    row('Should let a member pay a month skipped by another member', true, {
      arrange: (firestore) => seedSkippedMonth(firestore, { createdBy: 'uid-ana' }),
      batch: { updateOverdueMonth: true },
    }),
    row('Should not let a member turn a skipped month into paid-later without the payment', false, {
      arrange: seedSkippedMonth,
      batch: { entry: null, updateOverdueMonth: true },
    }),
    row('Should not let a member pay a skipped month and change its month', false, {
      arrange: seedSkippedMonth,
      batch: { updateOverdueMonth: true, overdueMonthChanges: { month: monthFromNow(-2) } },
    }),
    // O pagamento copia o nome e a tag da conta de agora, que podem ter mudado depois do pulo.
    row('Should let a member pay a skipped month of a bill renamed after the skip', true, {
      arrange: seedSkippedMonth,
      batch: { updateOverdueMonth: true, overdueMonthChanges: { name: 'Outro nome' } },
    }),
    row('Should let a member pay a skipped month of a bill whose tag changed after the skip', true, {
      arrange: seedSkippedMonth,
      batch: { updateOverdueMonth: true, overdueMonthChanges: { tagId: 't2' } },
    }),
    row('Should let a member pay a skipped month of a bill that lost its tag after the skip', true, {
      arrange: seedSkippedMonth,
      batch: { updateOverdueMonth: true, overdueMonthChanges: { tagId: deleteField() } },
    }),
    row('Should not let a member pay a month that is already paid-later', false, {
      arrange: seedOverduePayment,
      batch: { entryId: 'o2', entry: overduePaymentOf({ receiptFileId: 'f1' }), overdueMonth: paidLaterOverdueMonthOf({ entryId: 'o2' }), updateOverdueMonth: true },
    }),
  ];

  itEach(cases, run);
});

// Um mês da conta fica pago, pago depois ou pulado, nunca dois: o `entries` e o `overdueMonths` do mesmo id se excluem.
describe('recurringPayment create in a month that has a overdueMonths', () => {
  const payment = { entry: recurringPaymentOf({ month: PREVIOUS }) };
  const contribution = {
    entry: contributionOf({ month: PREVIOUS, entryId: overdueMonthIdOf() }),
    unownedPayment: unownedPaymentOf({ month: PREVIOUS }),
  };
  const cases = [
    { title: 'Should not let a member pay a month that was skipped', isAllowed: false, arrange: seedSkippedMonth, batch: payment, run: addPaymentBatch },
    { title: 'Should not let a member pay a month that was paid later', isAllowed: false, arrange: seedOverduePayment, batch: payment, run: addPaymentBatch },
    {
      title: 'Should not let a member create the unowned payment of a month that was skipped',
      isAllowed: false,
      arrange: seedSkippedMonth,
      batch: contribution,
      run: addContributionBatch,
    },
    {
      title: 'Should not let a member create the unowned payment of a month that was paid later',
      isAllowed: false,
      arrange: seedOverduePayment,
      batch: contribution,
      run: addContributionBatch,
    },
    {
      title: 'Should let a member pay a month when only another bill was skipped',
      isAllowed: true,
      arrange: (firestore) => setDoc(overdueMonthDocOf(firestore, overdueMonthIdOf({ recurringBillId: 'luz' })), skippedOverdueMonthOf({ recurringBillId: 'luz', name: 'Luz' })),
      batch: payment,
      run: addPaymentBatch,
    },
  ];

  itEach(cases, async ({ arrange, batch, isAllowed, run: write }) => {
    await asOwner(arrange);
    return assertAccess(isAllowed, write(bruno(), batch));
  });
});

// O `entries` e o `overdueMonths` do mesmo mês também não nascem juntos: cada um confere o outro no fim do lote, e não
// antes dele, senão um lote só criaria os dois.
describe('recurringPayment and skipped overdueMonths of the same month in one batch', () => {
  const skippedMonth = [[overdueMonthIdOf(), skippedOverdueMonthOf()]];
  const cases = [
    {
      title: 'Should not let a member pay a month and skip it in the same batch',
      run: () => addPaymentBatch(bruno(), { entry: recurringPaymentOf({ month: PREVIOUS }), extraOverdueMonths: skippedMonth }),
    },
    {
      title: 'Should not let a member create the unowned payment of a month and skip it in the same batch',
      run: () =>
        addContributionBatch(bruno(), {
          entry: contributionOf({ month: PREVIOUS, entryId: overdueMonthIdOf() }),
          unownedPayment: unownedPaymentOf({ month: PREVIOUS }),
          extraOverdueMonths: skippedMonth,
        }),
    },
  ];

  itEach(cases, ({ run: write }) => assertAccess(false, write()));
});

// O pagamento atrasado não recebe contribuição: ele só tem dono, sem a divisão do mês.
describe('contribution to an overdue payment', () => {
  it('Should not let a member contribute to an overdue payment', async () => {
    await asOwner(seedOverduePayment);
    return assertAccess(
      false,
      addContributionBatch(ana(), {
        entry: contributionOf({ month: CURRENT, entryId: 'o1', paidBy: 'uid-ana' }),
        file: receiptFileOf({ uploadedBy: 'uid-ana' }),
        email: 'ana@gmail.com',
      }),
    );
  });
});

describe('overduePayment update by profile', () => {
  const cases = [
    { title: 'Should let the author change the amount of an overdue payment', as: bruno, isAllowed: true },
    { title: 'Should not let another member change the amount of an overdue payment', as: ana, isAllowed: false },
    ...OUTSIDERS.map(({ who, as }) => ({ title: `Should not let ${who} change the amount of an overdue payment`, as, isAllowed: false })),
  ];

  itEach(cases, async ({ as, isAllowed }) => {
    await asOwner(seedOverduePayment);
    return assertAccess(isAllowed, updateDoc(entryDocOf(as(), 'o1'), { amountCents: 5000 }));
  });
});

// Em cada linha, `data` são os campos que o autor (Bruno) tenta mudar no pagamento atrasado dele.
describe('overduePayment update by the author', () => {
  const cases = [
    { title: 'Should let the author change the amount', data: { amountCents: 5000 }, isAllowed: true },
    { title: 'Should not let the author change the amount to zero', data: { amountCents: 0 }, isAllowed: false },
    { title: 'Should not let the author change the billMonth', data: { billMonth: '2026-09' }, isAllowed: false },
    { title: 'Should not let the author change the month', data: { month: monthFromNow(-1) }, isAllowed: false },
    { title: 'Should not let the author change the recurringBillId', data: { recurringBillId: 'luz' }, isAllowed: false },
    { title: 'Should not let the author change the name', data: { name: 'Outro nome' }, isAllowed: false },
    { title: 'Should not let the author change the tag', data: { tagId: deleteField() }, isAllowed: false },
    { title: 'Should not let the author change paidBy', data: { paidBy: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let the author change the kind', data: { kind: 'recurringPayment' }, isAllowed: false },
    { title: 'Should not let the author point receiptFileId to another record without a batch', data: { receiptFileId: 'f2' }, isAllowed: false },
  ];

  itEach(cases, async ({ data, isAllowed }) => {
    await asOwner(seedOverduePayment);
    return assertAccess(isAllowed, updateDoc(entryDocOf(bruno(), 'o1'), data));
  });
});

describe('overduePayment update of the receipt', () => {
  const cases = [
    { title: 'Should let the author replace the receipt of an overdue payment', as: bruno, isAllowed: true },
    { title: 'Should not let another member replace the receipt of an overdue payment', as: ana, isAllowed: false },
  ];

  itEach(cases, async ({ as, isAllowed }) => {
    await asOwner(seedOverduePayment);
    return assertAccess(isAllowed, replaceReceiptBatch(as(), { entryId: 'o1', oldFileId: 'fod', newFileId: 'fnew' }));
  });
});

// Desfazer o pagamento atrasado apaga o pagamento, o comprovante e o `paidLater` no mesmo lote: a conta volta a ficar atrasada.
describe('overduePayment delete', () => {
  const cases = [
    { title: 'Should let the author delete the overdue payment together with the paid-later month', as: bruno, batch: {}, isAllowed: true },
    { title: 'Should not let another member delete the overdue payment together with the paid-later month', as: ana, batch: {}, isAllowed: false },
    { title: 'Should not let the author delete the overdue payment and keep the paid-later month', as: bruno, batch: { overdueMonthId: null }, isAllowed: false },
    ...OUTSIDERS.map(({ who, as }) => ({ title: `Should not let ${who} delete the overdue payment`, as, batch: {}, isAllowed: false })),
  ];

  itEach(cases, async ({ as, batch, isAllowed }) => {
    await asOwner(seedOverduePayment);
    return assertAccess(isAllowed, deleteOverdueBatch(as(), batch));
  });
});
