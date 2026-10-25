import { describe } from 'node:test';

import { deleteDoc } from 'firebase/firestore';

import { SEEDED_RECEIPT_OF, asOwner, assertAccess, deleteEntryBatch, entryDocOf, entryRowsFor, fileOf, itEach, signedInAs } from './setup.mjs';

const ONE_OFF_IDS = { own: 'bruno1', other: 'ana1' };
const PAYMENT_IDS = { own: '2026-10_luz', other: '2026-10_aluguel' };

// Só quem pagou apaga, e o lote leva o registro do comprovante junto: o autor sim, o outro membro e o admin não.
describe('entries delete by profile, one-off bill', () => {
  itEach(entryRowsFor('delete', {}, ONE_OFF_IDS), ({ as, id, isAllowed }) =>
    assertAccess(isAllowed, deleteEntryBatch(as(), { entryId: id, fileId: SEEDED_RECEIPT_OF[id] })),
  );
});

describe('entries delete by profile, recurring payment', () => {
  itEach(entryRowsFor('delete', {}, PAYMENT_IDS), ({ as, id, isAllowed }) =>
    assertAccess(isAllowed, deleteEntryBatch(as(), { entryId: id, fileId: SEEDED_RECEIPT_OF[id] })),
  );
});

// Apagar só o lançamento deixaria o registro do comprovante sem dono.
describe('entries delete without the file record', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should not let the author delete a one-off bill without deleting its file record', run: () => deleteDoc(entryDocOf(bruno(), 'bruno1')) },
    { title: 'Should not let the author delete a recurring payment without deleting its file record', run: () => deleteDoc(entryDocOf(bruno(), '2026-10_luz')) },
    { title: 'Should not let the author delete a one-off bill in a batch that keeps its file record', run: () => deleteEntryBatch(bruno(), { entryId: 'bruno1', fileId: null }) },
  ];

  itEach(cases, ({ run }) => assertAccess(false, run()));
});

// Sem o registro do comprovante (apagado por fora), o lote da exclusão ainda apaga o lançamento: o `delete` de um
// registro que não existe não pode derrubar o lote.
describe('entries delete when the file record is already gone', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let the author delete a one-off bill whose file record is gone', entryId: 'bruno1', fileId: 'fbruno1' },
    { title: 'Should let the author delete a recurring payment whose file record is gone', entryId: '2026-10_luz', fileId: 'fpbruno' },
  ];

  itEach(cases, async ({ entryId, fileId }) => {
    await asOwner((firestore) => deleteDoc(fileOf(firestore, fileId)));
    return assertAccess(true, deleteEntryBatch(bruno(), { entryId, fileId }));
  });
});
