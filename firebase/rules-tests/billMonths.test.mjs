import { describe } from 'node:test';

import { deleteDoc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import {
  MEMBERS,
  OUTSIDERS,
  asOwner,
  assertAccess,
  billMonthDocOf,
  billMonthIdOf,
  billMonthsOf,
  deleteOverdueBatch,
  entryDocOf,
  itEach,
  monthFromNow,
  recurringPaymentOf,
  rowsFor,
  seedOverduePayment,
  seedSkippedMonth,
  signedInAs,
  skippedBillMonthOf,
  unownedPaymentOf,
} from './setup/index.mjs';

const bruno = () => signedInAs('bruno@gmail.com');
const ana = () => signedInAs('ana@gmail.com');
const CURRENT = monthFromNow(0);
const PREVIOUS = monthFromNow(-1);

/** Uma linha de `create`: `doc` troca campos do mês pulado do Bruno e `id` troca o id (o padrão sai do mês e da conta). */
function row(title, isAllowed, { doc = {}, id, as = bruno, arrange } = {}) {
  const billMonth = skippedBillMonthOf(doc);
  return { title, isAllowed, as, arrange, id: id ?? billMonthIdOf(billMonth), billMonth };
}

async function run({ as, arrange, id, billMonth, isAllowed }) {
  if (arrange) await asOwner(arrange);
  return assertAccess(isAllowed, setDoc(billMonthDocOf(as(), id), billMonth));
}

describe('billMonths skip by profile', () => {
  const cases = [
    row('Should let a member skip a past month', true),
    row('Should let the admin skip a past month', true, { as: ana, doc: { createdBy: 'uid-ana' } }),
    ...OUTSIDERS.map(({ who, as }) => row(`Should not let ${who} skip a month`, false, { as })),
    // Com o documento no próprio nome, só a lista recusa quem está fora dela.
    row('Should not let a person outside the list skip a month in their own name', false, {
      as: () => signedInAs('carla@gmail.com'),
      doc: { createdBy: 'uid-carla' },
    }),
  ];

  itEach(cases, run);
});

// Em cada linha, o documento é o do Bruno com os campos trocados: o que a linha troca é o que ela prova.
describe('billMonths skip by a member', () => {
  const paidMonthOfInternet = (firestore) => setDoc(entryDocOf(firestore, billMonthIdOf()), recurringPaymentOf({ month: PREVIOUS }));
  const unownedMonthOfInternet = (firestore) => setDoc(entryDocOf(firestore, billMonthIdOf()), unownedPaymentOf({ month: PREVIOUS }));
  const cases = [
    row('Should let a member skip a month without a tag', true, { doc: { tagId: undefined } }),
    row('Should not let a member skip the current month', false, { doc: { month: CURRENT } }),
    row('Should not let a member skip a future month', false, { doc: { month: monthFromNow(1) } }),
    row('Should not let a member skip a month before 2026-10', false, { doc: { month: '2026-09' } }),
    row('Should not let a member skip a month written as 2026-9', false, { doc: { month: '2026-9' } }),
    row('Should not let a member skip a month with an id different from month_recurringBillId', false, { id: `${PREVIOUS}_outra` }),
    row('Should not let a member skip a month of a bill that does not exist', false, { doc: { recurringBillId: 'naoexiste' } }),
    row('Should not let a member skip a month for another person', false, { doc: { createdBy: 'uid-ana' } }),
    row('Should not let a member skip a month with a createdAt that is not the server time', false, { doc: { createdAt: new Date() } }),
    row('Should not let a member skip a month already paid in entries', false, { arrange: paidMonthOfInternet }),
    row('Should not let a member skip a month that has contributions', false, { arrange: unownedMonthOfInternet }),
    row('Should not let a member skip a month with the status as something else', false, { doc: { status: 'archived' } }),
    row('Should not let a member skip a month with an entryId', false, { doc: { entryId: 'o1' } }),
    row('Should not let a member skip a month with a key besides the model', false, { doc: { note: 'a mais' } }),
    ...['status', 'month', 'recurringBillId', 'name', 'createdBy', 'createdAt'].map((key) =>
      row(`Should not let a member skip a month without ${key}`, false, { doc: { [key]: undefined } }),
    ),
    row('Should not let a member skip a month with an empty name', false, { doc: { name: '' } }),
    row('Should not let a member skip a month with a name of 61 characters', false, { doc: { name: 'a'.repeat(61) } }),
    row('Should let a member skip a month with a name of 60 characters', true, { doc: { name: 'a'.repeat(60) } }),
    row('Should not let a member skip a month with a tagId that is not a text', false, { doc: { tagId: 7 } }),
  ];

  itEach(cases, run);
});

describe('billMonths read', () => {
  const cases = [...rowsFor(MEMBERS, 'read a month', true), ...rowsFor(OUTSIDERS, 'read a month', false)];

  itEach(cases, async ({ as, isAllowed }) => {
    await asOwner(seedSkippedMonth);
    await assertAccess(isAllowed, getDoc(billMonthDocOf(as(), billMonthIdOf())));
    await assertAccess(isAllowed, getDocs(billMonthsOf(as())));
  });
});

describe('billMonths delete', () => {
  const cases = [...rowsFor(MEMBERS, 'delete the skipped month', true), ...rowsFor(OUTSIDERS, 'delete the skipped month', false)];

  itEach(cases, async ({ as, isAllowed }) => {
    await asOwner(seedSkippedMonth);
    return assertAccess(isAllowed, deleteDoc(billMonthDocOf(as(), billMonthIdOf())));
  });
});

// O segundo Desfazer, ou o de outro membro ao mesmo tempo, encontra o mês já apagado: passa, e nada muda.
describe('billMonths delete of a month that no longer exists', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'delete a month that no longer exists', true),
    ...rowsFor(OUTSIDERS, 'delete a month that no longer exists', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, deleteDoc(billMonthDocOf(as(), billMonthIdOf()))));
});

// O `paidLater` só sai junto do `overduePayment` que o aponta: sozinho, a conta ficaria paga sem pagamento.
describe('billMonths delete of a paid-later month', () => {
  const cases = [
    { title: 'Should not let the author delete the paid-later month alone', run: () => deleteDoc(billMonthDocOf(bruno(), billMonthIdOf())), isAllowed: false },
    { title: 'Should not let another member delete the paid-later month alone', run: () => deleteDoc(billMonthDocOf(ana(), billMonthIdOf())), isAllowed: false },
    {
      title: 'Should not let the author delete the paid-later month in a batch that keeps the payment',
      run: () => deleteOverdueBatch(bruno(), { entryId: null }),
      isAllowed: false,
    },
    {
      title: 'Should let anyone delete a paid-later month whose payment no longer exists',
      run: () => deleteDoc(billMonthDocOf(ana(), billMonthIdOf())),
      isAllowed: true,
      arrange: (firestore) => deleteDoc(entryDocOf(firestore, 'o1')),
    },
  ];

  itEach(cases, async ({ run, arrange, isAllowed }) => {
    await asOwner(seedOverduePayment);
    if (arrange) await asOwner(arrange);
    return assertAccess(isAllowed, run());
  });
});

// Um mês muda de estado uma vez, de pulado para pago depois, no lote do pagamento (veja `entries.overdue`): fora
// disso o documento não é alterado por ninguém.
describe('billMonths update outside the payment batch', () => {
  const cases = [
    { title: 'Should not let a member rename a skipped month', seed: 'skipped', data: { name: 'Outro nome' } },
    { title: 'Should not let a member change the month of a skipped month', seed: 'skipped', data: { month: monthFromNow(-2) } },
    { title: 'Should not let the author turn a paid-later month into skipped', seed: 'paidLater', data: { status: 'skipped' } },
    { title: 'Should not let the author change the payment a paid-later month points to', seed: 'paidLater', data: { entryId: 'o2' } },
  ];

  itEach(cases, async ({ seed, data }) => {
    await asOwner(seed === 'skipped' ? seedSkippedMonth : seedOverduePayment);
    return assertAccess(false, updateDoc(billMonthDocOf(bruno(), billMonthIdOf()), data));
  });
});
