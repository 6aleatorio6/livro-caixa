import { describe } from 'node:test';

import { serverTimestamp, updateDoc } from 'firebase/firestore';

import { assertAccess, entryDocOf, entryRowsFor, itEach, signedInAs } from './setup.mjs';

const bruno = () => signedInAs('bruno@gmail.com');

// Só o autor muda, e só nome, valor, tag e data (com o mês junto).
describe('entries update by profile', () => {
  const cases = entryRowsFor('change', { data: { name: 'Geladeira nova' } });

  itEach(cases, ({ as, id, data: changes, isAllowed }) => assertAccess(isAllowed, updateDoc(entryDocOf(as(), id), changes)));
});

// Em cada linha, `data` são os campos que o autor (Bruno) tenta mudar na conta dele.
describe('entries update by the author', () => {
  const cases = [
    { title: 'Should let the author change the name', data: { name: 'Geladeira nova' }, isAllowed: true },
    { title: 'Should let the author change the amount', data: { amountCents: 40000 }, isAllowed: true },
    { title: 'Should let the author change the tag', data: { tagId: 't2' }, isAllowed: true },
    { title: 'Should let the author change the date together with the month', data: { date: '2026-10-05', month: '2026-10' }, isAllowed: true },
    { title: 'Should let the author change the date inside the same month', data: { date: '2026-09-01' }, isAllowed: true },
    { title: 'Should not let the author change the date to another month without the month', data: { date: '2026-10-05' }, isAllowed: false },
    { title: 'Should not let the author change paidBy', data: { paidBy: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let the author change the kind', data: { kind: 'recurringPayment' }, isAllowed: false },
    { title: 'Should not let the author change createdAt', data: { createdAt: serverTimestamp() }, isAllowed: false },
    { title: 'Should not let the author change receiptFileId', data: { receiptFileId: 'f2' }, isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, updateDoc(entryDocOf(bruno(), 'bruno1'), data)));
});
