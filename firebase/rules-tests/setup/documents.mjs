import { serverTimestamp } from 'firebase/firestore';

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

/** O registro do comprovante (uma imagem do Bruno), com os campos trocados em `overrides`. */
export function receiptFileOf(id, overrides = {}) {
  return withoutUndefined({ storagePath: `files/${id}`, type: 'image', contentType: 'image/webp', sizeBytes: 812345, uploadedBy: 'uid-bruno', name: 'comprovante.webp', ...overrides });
}
