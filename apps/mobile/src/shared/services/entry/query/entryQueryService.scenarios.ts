import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana e Bruno estão na lista.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const BOTH_IN_THE_LIST = {
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

// A Luz de outubro paga pelo Bruno: R$ 187,35 de R$ 210,00 previstos, vencia no dia 10.
const ELECTRICITY_PAYMENT = {
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
  receiptFileId: 'f-electricity',
};
// O conserto da geladeira, conta avulsa da Ana; a avulsa sem tag não tem o campo `tagId`.
const FRIDGE_WITHOUT_TAG = {
  kind: 'oneOffBill',
  createdAt: new Date('2026-10-12T15:00:00Z'),
  month: '2026-10',
  name: 'Conserto da geladeira',
  amountCents: 35000,
  date: '2026-10-12',
  paidBy: testAccountUid(ANA),
  receiptFileId: 'f-fridge',
};
const FRIDGE = { ...FRIDGE_WITHOUT_TAG, tagId: HOME_TAG_ID };

// O que a tela recebe: os mesmos campos, sem `createdAt`, e `tagId: null` sem tag.
const toEntry = (id: string, { createdAt: _createdAt, ...entry }: Record<string, unknown>) =>
  ({ id, tagId: null, ...entry }) as IEntry;

export const entryQueryScenarios = {
  // O Bruno abre o pagamento dele; o valor pago é corrigido com a folha aberta.
  paymentOfTheMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': ELECTRICITY_PAYMENT },
    input: { id: '2026-10_electricity' },
    result: toEntry('2026-10_electricity', { ...ELECTRICITY_PAYMENT, date: null, paidOn: '2026-10-10' }),
    afterChange: {
      write: { 'entries/2026-10_electricity': { ...ELECTRICITY_PAYMENT, amountCents: 20000 } },
      result: toEntry('2026-10_electricity', { ...ELECTRICITY_PAYMENT, amountCents: 20000, date: null, paidOn: '2026-10-10' }),
    },
  },
  // Qualquer membro lê o lançamento de outro: o Bruno abre a avulsa da Ana.
  oneOffBillOfAnotherMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': FRIDGE },
    input: { id: 'fridge' },
    result: toEntry('fridge', FRIDGE),
  },
  oneOffBillWithoutTag: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': FRIDGE_WITHOUT_TAG },
    input: { id: 'fridge' },
    result: toEntry('fridge', FRIDGE_WITHOUT_TAG),
  },
  // O autor exclui o lançamento com a folha aberta em outro aparelho: a leitura passa a entregar `null`.
  deletedEntry: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': FRIDGE },
    input: { id: 'fridge' },
    result: toEntry('fridge', FRIDGE),
    afterChange: { write: { 'entries/fridge': null }, result: null },
  },
  // Um id que não existe (um link velho) entrega `null` desde o começo.
  missingEntry: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: { id: 'fridge' },
    result: null,
  },
} satisfies Record<string, IServiceScenario<{ id: string }, IEntry | null>>;
