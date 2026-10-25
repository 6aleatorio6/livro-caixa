import { writeBatch } from 'firebase/firestore';

import { oneOffBillOf, receiptContentOf, receiptFileOf, recurringPaymentOf } from './documents.mjs';
import { entryDocOf, entryOf, fileContentOf, fileOf } from './refs.mjs';

// O registro e o conteúdo do comprovante entram e saem do lote juntos, como o app os grava.
function addReceipt(batch, firestore, id, file) {
  batch.set(fileOf(firestore, id), file);
  batch.set(fileContentOf(firestore, id), receiptContentOf(file.sizeBytes));
}

function deleteReceipt(batch, firestore, id) {
  batch.delete(fileOf(firestore, id));
  batch.delete(fileContentOf(firestore, id));
}

/** O lote que apaga o registro e o conteúdo de um comprovante, sem o lançamento. */
export function deleteReceiptBatch(firestore, id) {
  const batch = writeBatch(firestore);
  deleteReceipt(batch, firestore, id);
  return batch.commit();
}

/**
 * O lote de um comprovante sem o lançamento: o registro e o conteúdo (`content: null` deixa o conteúdo de fora; o
 * padrão tem o tamanho do `sizeBytes` do registro).
 */
export function receiptBatch(firestore, id, { file = receiptFileOf(), content = receiptContentOf(file.sizeBytes) } = {}) {
  const batch = writeBatch(firestore);
  batch.set(fileOf(firestore, id), file);
  if (content !== null) batch.set(fileContentOf(firestore, id), content);
  return batch.commit();
}

/**
 * O lote como o app grava: o registro e o conteúdo do arquivo, o lançamento e o `hasEntries: true` de `email`.
 * `file: null` deixa o registro e o conteúdo de fora, e `markHasEntries: false` deixa de fora o `hasEntries`.
 */
export function addEntryBatch(firestore, { entryId, entry, fileId = entry.receiptFileId, file = receiptFileOf(), email = 'bruno@gmail.com', markHasEntries = true }) {
  const batch = writeBatch(firestore);
  if (file !== null) addReceipt(batch, firestore, fileId, file);
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
 * O lote da troca do comprovante como o app grava: cria o registro e o conteúdo novos (`newFile`, o padrão de
 * `newFileId`; `null` deixa os dois de fora, para apontar para um que já existia), atualiza o lançamento com o
 * `receiptFileId` novo e o resto de `changes`, e apaga o registro e o conteúdo antigos (`oldFileId: null` os deixa
 * de fora).
 */
export function replaceReceiptBatch(firestore, { entryId, oldFileId, newFileId, changes = {}, newFile = receiptFileOf() }) {
  const batch = writeBatch(firestore);
  if (newFile !== null) addReceipt(batch, firestore, newFileId, newFile);
  batch.update(entryDocOf(firestore, entryId), { receiptFileId: newFileId, ...changes });
  if (oldFileId !== null) deleteReceipt(batch, firestore, oldFileId);
  return batch.commit();
}

/** O lote da exclusão como o app grava: o lançamento, o registro e o conteúdo do comprovante (`fileId: null` apaga só o lançamento). */
export function deleteEntryBatch(firestore, { entryId, fileId }) {
  const batch = writeBatch(firestore);
  batch.delete(entryDocOf(firestore, entryId));
  if (fileId !== null) deleteReceipt(batch, firestore, fileId);
  return batch.commit();
}
