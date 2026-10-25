import { writeBatch } from 'firebase/firestore';

import { oneOffBillOf, receiptFileOf, recurringPaymentOf } from './documents.mjs';
import { entryDocOf, entryOf, fileOf } from './refs.mjs';

/**
 * O lote como o app grava: o registro do arquivo, o lançamento e o `hasEntries: true` de `email`.
 * `file: null` deixa o registro de fora, e `markHasEntries: false` deixa de fora o `hasEntries`.
 */
export function addEntryBatch(firestore, { entryId, entry, fileId = entry.receiptFileId, file = receiptFileOf(fileId), email = 'bruno@gmail.com', markHasEntries = true }) {
  const batch = writeBatch(firestore);
  if (file !== null) batch.set(fileOf(firestore, fileId), file);
  batch.set(entryDocOf(firestore, entryId), entry);
  if (markHasEntries) batch.update(entryOf(firestore, email), { hasEntries: true });
  return batch.commit();
}

export function addOneOffBillBatch(firestore, { entryId = 'e1', entry = oneOffBillOf(), ...rest } = {}) {
  return addEntryBatch(firestore, { entryId, entry, ...rest });
}

/**
 * O lote do pagamento como o app grava: o id do lançamento é `{month}_{recurringBillId}` (o do `entry`, a não
 * ser que `entryId` o troque). Se o documento já existe, a gravação vira um `update`.
 */
export function addPaymentBatch(firestore, { entry = recurringPaymentOf(), entryId = `${entry.month}_${entry.recurringBillId}`, ...rest } = {}) {
  return addEntryBatch(firestore, { entryId, entry, ...rest });
}

/**
 * O lote da troca do comprovante como o app grava: cria o registro novo (`newFile`, o padrão de `newFileId`;
 * `null` deixa de fora, para apontar para um que já existia), atualiza o lançamento com o `receiptFileId` novo
 * e o resto de `changes`, e apaga o registro antigo (`oldFileId: null` o deixa de fora).
 */
export function replaceReceiptBatch(firestore, { entryId, oldFileId, newFileId, changes = {}, newFile = receiptFileOf(newFileId) }) {
  const batch = writeBatch(firestore);
  if (newFile !== null) batch.set(fileOf(firestore, newFileId), newFile);
  batch.update(entryDocOf(firestore, entryId), { receiptFileId: newFileId, ...changes });
  if (oldFileId !== null) batch.delete(fileOf(firestore, oldFileId));
  return batch.commit();
}

/** O lote da exclusão como o app grava: o lançamento e o registro do comprovante (`fileId: null` apaga só o lançamento). */
export function deleteEntryBatch(firestore, { entryId, fileId }) {
  const batch = writeBatch(firestore);
  batch.delete(entryDocOf(firestore, entryId));
  if (fileId !== null) batch.delete(fileOf(firestore, fileId));
  return batch.commit();
}
