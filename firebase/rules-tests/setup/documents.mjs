import { Bytes, serverTimestamp } from 'firebase/firestore';

/** A tag semeada em `settings/tags`, com a chave `t1`. */
export const SEEDED_TAG = { name: 'Casa', nameKey: 'casa', color: 'wood' };

/** A conta recorrente semeada com o id `internet`. */
export const SEEDED_BILL = { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01', tagId: 't1' };

/** O registro do comprovante semeado de cada lançamento semeado (`beforeEach`). */
export const SEEDED_RECEIPT_OF = { bruno1: 'fbruno1', ana1: 'fana1', '2026-10_luz': 'fpbruno', '2026-10_aluguel': 'fpana' };

// Um campo com `undefined` sai do documento: o Firestore recusa `undefined`, e a regra olha as chaves que faltam.
function withoutUndefined(document) {
  for (const key of Object.keys(document)) if (document[key] === undefined) delete document[key];
  return document;
}

/** A conta avulsa válida do Bruno, com os campos trocados em `overrides`. */
export function oneOffBillOf(overrides = {}) {
  return withoutUndefined({
    kind: 'oneOffBill',
    month: '2026-09',
    name: 'Conserto da geladeira',
    amountCents: 35000,
    date: '2026-09-30',
    tagId: 't1',
    paidBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    receiptFileId: 'f1',
    ...overrides,
  });
}

/** O pagamento de conta recorrente válido do Bruno (a internet de 2026-10), com os campos trocados em `overrides`. */
export function recurringPaymentOf(overrides = {}) {
  return withoutUndefined({
    kind: 'recurringPayment',
    month: '2026-10',
    recurringBillId: 'internet',
    name: 'Internet',
    amountCents: 11990,
    dueDay: 15,
    expectedAmountCents: 11990,
    tagId: 't1',
    paidBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    receiptFileId: 'f1',
    ...overrides,
  });
}

/**
 * A contribuição válida do Bruno (no aluguel de 2026-10, pago pela Ana), com os campos trocados em `overrides`. Não
 * tem nome, data nem tag: vêm do lançamento que ela recebe (`entryId`).
 */
export function contributionOf(overrides = {}) {
  return withoutUndefined({
    kind: 'contribution',
    month: '2026-10',
    entryId: '2026-10_aluguel',
    amountCents: 50000,
    paidBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    receiptFileId: 'f1',
    ...overrides,
  });
}

/**
 * O pagamento sem dono da internet de 2026-10: as cópias da conta, sem `paidBy`, `amountCents` e `receiptFileId`,
 * gravado na primeira contribuição de um mês sem pagamento. Os campos trocados vêm em `overrides`.
 */
export function unownedPaymentOf(overrides = {}) {
  return withoutUndefined({
    kind: 'recurringPayment',
    month: '2026-10',
    recurringBillId: 'internet',
    name: 'Internet',
    dueDay: 15,
    expectedAmountCents: 11990,
    tagId: 't1',
    createdAt: serverTimestamp(),
    ...overrides,
  });
}

/**
 * O pagamento de conta atrasada válido do Bruno: a internet do mês anterior (`billMonth`), paga no mês atual (`month`),
 * com os campos trocados em `overrides`. Tem as chaves do pagamento mais o `billMonth`.
 */
export function overduePaymentOf(overrides = {}) {
  return withoutUndefined({
    kind: 'overduePayment',
    month: monthFromNow(0),
    billMonth: monthFromNow(-1),
    recurringBillId: 'internet',
    name: 'Internet',
    amountCents: 11990,
    dueDay: 15,
    expectedAmountCents: 11990,
    tagId: 't1',
    paidBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    receiptFileId: 'f1',
    ...overrides,
  });
}

/** O mês pulado válido, gravado pelo Bruno: a internet do mês anterior, com os campos trocados em `overrides`. */
export function skippedBillMonthOf(overrides = {}) {
  return withoutUndefined({
    status: 'skipped',
    month: monthFromNow(-1),
    recurringBillId: 'internet',
    name: 'Internet',
    tagId: 't1',
    createdBy: 'uid-bruno',
    createdAt: serverTimestamp(),
    ...overrides,
  });
}

/** O mês pago depois, válido, gravado pelo Bruno: o pulado mais o `entryId` do pagamento atrasado (`o1`). */
export function paidLaterBillMonthOf(overrides = {}) {
  return skippedBillMonthOf({ status: 'paidLater', entryId: 'o1', ...overrides });
}

/** O id de um `billMonths`: o mesmo que o pagamento daquele mês teria em `entries`. */
export function billMonthIdOf({ month = monthFromNow(-1), recurringBillId = 'internet' } = {}) {
  return `${month}_${recurringBillId}`;
}

/** O mês `AAAA-MM` a `offset` meses do mês atual, em UTC: o relógio do `request.time` da regra. */
export function monthFromNow(offset) {
  const now = new Date();
  const index = now.getUTCFullYear() * 12 + now.getUTCMonth() + offset;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** O tamanho do comprovante dos casos: pequeno, para o emulador não carregar quase 1 MiB a cada lote. */
export const RECEIPT_SIZE_BYTES = 1234;

/** O maior comprovante que cabe no documento (900 KiB), o mesmo limite do app. */
export const RECEIPT_MAX_BYTES = 921600;

/** O registro do comprovante (uma imagem do Bruno), com os campos trocados em `overrides`. */
export function receiptFileOf(overrides = {}) {
  return withoutUndefined({ type: 'image', contentType: 'image/webp', sizeBytes: RECEIPT_SIZE_BYTES, uploadedBy: 'uid-bruno', name: 'comprovante.webp', ...overrides });
}

/**
 * O conteúdo do comprovante em `fileContents/{id}`: `sizeBytes` bytes zerados. Um `sizeBytes` que não serve de
 * tamanho (fracionário, ausente) dá o tamanho padrão.
 */
export function receiptContentOf(sizeBytes = RECEIPT_SIZE_BYTES) {
  const length = Number.isInteger(sizeBytes) ? sizeBytes : RECEIPT_SIZE_BYTES;
  return { content: Bytes.fromUint8Array(new Uint8Array(length)) };
}
