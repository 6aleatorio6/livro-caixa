import { writeBatch } from 'firebase/firestore';

import { overdueMonthIdOf, contributionOf, oneOffBillOf, overduePaymentOf, paidLaterOverdueMonthOf, receiptContentOf, receiptFileOf, recurringPaymentOf } from './documents.mjs';
import { overdueMonthDocOf, entryDocOf, entryOf, fileContentOf, fileOf } from './refs.mjs';

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
 * `file: null` deixa o registro e o conteúdo de fora, e `markHasEntries: false` deixa de fora o `hasEntries`;
 * `extraOverdueMonths` são pares `[id, documento]` de `overdueMonths` que entram no mesmo lote.
 */
export function addEntryBatch(
  firestore,
  { entryId, entry, fileId = entry.receiptFileId, file = receiptFileOf(), email = 'bruno@gmail.com', markHasEntries = true, extraOverdueMonths = [] },
) {
  const batch = writeBatch(firestore);
  if (file !== null) addReceipt(batch, firestore, fileId, file);
  batch.set(entryDocOf(firestore, entryId), entry);
  for (const [id, document] of extraOverdueMonths) batch.set(overdueMonthDocOf(firestore, id), document);
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
 * O lote da contribuição como o app grava: o comprovante, a contribuição (`entryId`, id gerado) e o `hasEntries`. Na
 * primeira contribuição de um mês sem pagamento, `unownedPayment` entra no lote com o id `{month}_{recurringBillId}`;
 * `extraOverdueMonths` são pares `[id, documento]` de `overdueMonths` do mesmo lote.
 */
export function addContributionBatch(firestore, { entryId = 'c1', entry = contributionOf(), unownedPayment = null, ...rest } = {}) {
  if (unownedPayment === null) return addEntryBatch(firestore, { entryId, entry, ...rest });
  const { fileId = entry.receiptFileId, file = receiptFileOf(), email = 'bruno@gmail.com', markHasEntries = true, extraOverdueMonths = [] } = rest;
  const batch = writeBatch(firestore);
  if (file !== null) addReceipt(batch, firestore, fileId, file);
  batch.set(entryDocOf(firestore, `${unownedPayment.month}_${unownedPayment.recurringBillId}`), unownedPayment);
  for (const [id, document] of extraOverdueMonths) batch.set(overdueMonthDocOf(firestore, id), document);
  batch.set(entryDocOf(firestore, entryId), entry);
  if (markHasEntries) batch.update(entryOf(firestore, email), { hasEntries: true });
  return batch.commit();
}

/**
 * O lote em que o pagamento sem dono `paymentId` ganha o dono: o comprovante novo (`file: null` o deixa de fora), os
 * campos de `owner` e o `hasEntries` de `email`. `deleteContributionId` apaga no mesmo lote a contribuição que vira
 * esse pagamento, sem o comprovante dela, que passa para o pagamento.
 */
export function takeOwnershipBatch(firestore, { paymentId, owner, file = receiptFileOf(), email = 'bruno@gmail.com', deleteContributionId = null }) {
  const batch = writeBatch(firestore);
  if (file !== null) addReceipt(batch, firestore, owner.receiptFileId, file);
  batch.update(entryDocOf(firestore, paymentId), owner);
  if (deleteContributionId !== null) batch.delete(entryDocOf(firestore, deleteContributionId));
  batch.update(entryOf(firestore, email), { hasEntries: true });
  return batch.commit();
}

/**
 * O lote que transforma o pagamento `paymentId` numa contribuição: o pagamento perde o dono (`removal`, os campos
 * apagados) e a contribuição `contributionId` nasce com o valor e o comprovante dele.
 */
export function paymentToContributionBatch(firestore, { paymentId, removal, contributionId, contribution }) {
  const batch = writeBatch(firestore);
  batch.update(entryDocOf(firestore, paymentId), removal);
  batch.set(entryDocOf(firestore, contributionId), contribution);
  return batch.commit();
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

/**
 * O lote do pagamento de uma conta atrasada como o app grava: o comprovante, o `overduePayment` (`entryId`, id gerado), o
 * `overdueMonths` `paidLater` que aponta para ele e o `hasEntries`; `extraEntries` são trios `[id, lançamento, id do
 * comprovante]` de outros pagamentos do lote, e `extraOverdueMonths` pares `[id, documento]` de outros `overdueMonths`. `entry: null` deixa o pagamento e o comprovante de
 * fora; `overdueMonth: null` deixa o `overdueMonths` de fora. Com `updateOverdueMonth`, o `overdueMonths` já existe (pulado) e vira
 * `paidLater` por um `update` dos campos que o app troca, mais `overdueMonthChanges`.
 */
export function payOverdueBatch(
  firestore,
  {
    entryId = 'o1',
    entry = overduePaymentOf(),
    fileId = entry?.receiptFileId,
    file = receiptFileOf(),
    overdueMonth = paidLaterOverdueMonthOf(),
    overdueMonthId = overdueMonth ? overdueMonthIdOf(overdueMonth) : null,
    updateOverdueMonth = false,
    overdueMonthChanges = {},
    extraEntries = [],
    extraOverdueMonths = [],
    email = 'bruno@gmail.com',
    markHasEntries = true,
  } = {},
) {
  const batch = writeBatch(firestore);
  if (entry !== null) {
    if (file !== null) addReceipt(batch, firestore, fileId, file);
    batch.set(entryDocOf(firestore, entryId), entry);
  }
  if (overdueMonth !== null && updateOverdueMonth) {
    const { status, entryId: paidEntryId, createdBy, createdAt } = overdueMonth;
    batch.update(overdueMonthDocOf(firestore, overdueMonthId), { status, entryId: paidEntryId, createdBy, createdAt, ...overdueMonthChanges });
  } else if (overdueMonth !== null) {
    batch.set(overdueMonthDocOf(firestore, overdueMonthId), overdueMonth);
  }
  for (const [id, document, extraFileId] of extraEntries) {
    addReceipt(batch, firestore, extraFileId, receiptFileOf());
    batch.set(entryDocOf(firestore, id), document);
  }
  for (const [id, document] of extraOverdueMonths) batch.set(overdueMonthDocOf(firestore, id), document);
  if (markHasEntries) batch.update(entryOf(firestore, email), { hasEntries: true });
  return batch.commit();
}

/**
 * O lote que desfaz o pagamento atrasado como o app grava: apaga o `overduePayment`, o comprovante dele e o
 * `overdueMonths` `paidLater`. `entryId: null` deixa o pagamento e o comprovante de fora; `overdueMonthId: null` deixa o
 * `overdueMonths` de fora.
 */
export function deleteOverdueBatch(firestore, { entryId = 'o1', fileId = 'fod', overdueMonthId = overdueMonthIdOf() } = {}) {
  const batch = writeBatch(firestore);
  if (entryId !== null) {
    batch.delete(entryDocOf(firestore, entryId));
    deleteReceipt(batch, firestore, fileId);
  }
  if (overdueMonthId !== null) batch.delete(overdueMonthDocOf(firestore, overdueMonthId));
  return batch.commit();
}
