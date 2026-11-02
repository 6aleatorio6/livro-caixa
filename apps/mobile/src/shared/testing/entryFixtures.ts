import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { entryOf } from '@/shared/testing/entryOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';
import type { IReceipt } from '@/shared/types/file/Receipt';

// Os lançamentos dos cenários de alterar e excluir. As pessoas são as contas de teste das jornadas:
// Ana e Bruno estão na lista, e o Bruno é o autor dos lançamentos daqui, salvo o que diz o contrário.
export const ANA = 'ana.souza@exemplo.com';
export const BRUNO = 'bruno.souza@exemplo.com';
export const BOTH_IN_THE_LIST = {
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

/** O registro do comprovante dos lançamentos daqui: os cenários que guardam um comprovante o guardam com este id. */
export const RECEIPT_FILE_ID = 'f-receipt';

/** O comprovante novo: o PNG guardado em `fixtures/`, que o contrato grava em `fileContents`. */
export const NEW_RECEIPT: IReceipt = {
  uri: RECEIPT_FIXTURE.uri,
  name: 'comprovante-novo.png',
  contentType: 'image/png',
  sizeBytes: RECEIPT_FIXTURE.sizeBytes,
  type: 'image',
  wasReduced: false,
  readAmountCents: null,
};

// A Luz de outubro, paga por R$ 187,35 de R$ 210,00 previstos. O pagamento não tem `date`.
export const PAYMENT_DOCUMENT = {
  kind: 'recurringPayment',
  createdAt: new Date('2026-10-10T15:00:00Z'),
  month: '2026-10',
  recurringBillId: 'electricity',
  name: 'Luz',
  amountCents: 18735,
  dueDay: 10,
  expectedAmountCents: 21000,
  tagId: UTILITIES_TAG_ID,
  paidBy: testAccountUid(BRUNO),
  receiptFileId: RECEIPT_FILE_ID,
};
export const PAYMENT = entryOf('2026-10_electricity', { ...PAYMENT_DOCUMENT, date: null, paidOn: '2026-10-10' });

// O conserto da geladeira, conta avulsa; a avulsa sem tag não tem o campo `tagId`.
export const ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT = {
  kind: 'oneOffBill',
  createdAt: new Date('2026-10-12T15:00:00Z'),
  month: '2026-10',
  name: 'Conserto da geladeira',
  amountCents: 35000,
  date: '2026-10-12',
  paidBy: testAccountUid(BRUNO),
  receiptFileId: RECEIPT_FILE_ID,
};
export const ONE_OFF_BILL_DOCUMENT = { ...ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT, tagId: HOME_TAG_ID };
export const ONE_OFF_BILL = entryOf('fridge', ONE_OFF_BILL_DOCUMENT);

// A contribuição da Ana, R$ 40,00, na Luz paga pelo Bruno. Não tem nome, data nem tag: vêm da Luz.
export const CONTRIBUTION_FILE_ID = 'f-contribution';
export const CONTRIBUTION_DOCUMENT = {
  kind: 'contribution',
  createdAt: new Date('2026-10-11T15:00:00Z'),
  month: '2026-10',
  entryId: '2026-10_electricity',
  amountCents: 4000,
  paidBy: testAccountUid(ANA),
  receiptFileId: CONTRIBUTION_FILE_ID,
};
export const CONTRIBUTION: IContributionEntry = {
  id: 'c-ana',
  kind: 'contribution',
  month: '2026-10',
  entryId: '2026-10_electricity',
  amountCents: 4000,
  paidBy: testAccountUid(ANA),
  receiptFileId: CONTRIBUTION_FILE_ID,
  paidOn: '2026-10-11',
};

// A Internet de outubro sem dono: a primeira contribuição a gravou com as cópias da conta, R$ 120,00 previstos.
export const UNOWNED_PAYMENT_DOCUMENT = {
  kind: 'recurringPayment',
  createdAt: new Date('2026-10-09T15:00:00Z'),
  month: '2026-10',
  recurringBillId: 'internet',
  name: 'Internet',
  dueDay: 15,
  expectedAmountCents: 12000,
  tagId: HOME_TAG_ID,
};
export const UNOWNED_PAYMENT = entryOf<IUnownedPaymentEntry>('2026-10_internet', {
  ...UNOWNED_PAYMENT_DOCUMENT,
  date: null,
  paidOn: '2026-10-09',
  paidBy: null,
  amountCents: null,
  receiptFileId: null,
});
