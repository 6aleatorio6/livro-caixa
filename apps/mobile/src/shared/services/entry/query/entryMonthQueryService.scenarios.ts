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

// O que o documento grava (sem o id); a conta sem tag não tem o campo `tagId`.
const base = { kind: 'oneOffBill', createdAt: new Date('2026-10-20T12:00:00Z') } as const;
// A Farmácia foi lançada depois do Estacionamento, no mesmo dia: o desempate é a hora do lançamento, não o nome.
const PHARMACY = { ...base, createdAt: new Date('2026-10-12T18:00:00Z'), month: '2026-10', name: 'Farmácia', amountCents: 8990, date: '2026-10-12', tagId: HOME_TAG_ID, paidBy: testAccountUid(BRUNO), receiptFileId: 'f1' };
const MARKET = { ...base, month: '2026-10', name: 'Mercado', amountCents: 25000, date: '2026-10-20', tagId: UTILITIES_TAG_ID, paidBy: testAccountUid(ANA), receiptFileId: 'f2' };
const GARAGE = { ...base, createdAt: new Date('2026-10-12T09:00:00Z'), month: '2026-10', name: 'Estacionamento', amountCents: 1500, date: '2026-10-12', paidBy: testAccountUid(ANA), receiptFileId: 'f3' };
// O pagamento da Internet pela Ana, sem `date`.
const INTERNET_PAYMENT = { kind: 'recurringPayment', createdAt: new Date('2026-10-15T15:00:00Z'), month: '2026-10', recurringBillId: 'internet', name: 'Internet', amountCents: 11990, dueDay: 15, expectedAmountCents: 11990, tagId: HOME_TAG_ID, paidBy: testAccountUid(ANA), receiptFileId: 'f7' };
const BRUNO_INTERNET_PAYMENT = { ...INTERNET_PAYMENT, amountCents: 12500, paidBy: testAccountUid(BRUNO) };
const SEPTEMBER = { ...base, month: '2026-09', name: 'Gráfica', amountCents: 3000, date: '2026-09-30', paidBy: testAccountUid(BRUNO), receiptFileId: 'f4' };
// O mês do desenho do Início: três pagamentos (a Luz pagou R$ 187,35 de R$ 210,00 previstos) e a avulsa do Bruno.
const RENT_PAYMENT = { kind: 'recurringPayment', createdAt: new Date('2026-10-05T15:00:00Z'), month: '2026-10', recurringBillId: 'rent', name: 'Aluguel', amountCents: 180000, dueDay: 5, expectedAmountCents: 180000, tagId: HOME_TAG_ID, paidBy: testAccountUid(ANA), receiptFileId: 'f8' };
const CONDO_PAYMENT = { ...RENT_PAYMENT, createdAt: new Date('2026-10-08T15:00:00Z'), recurringBillId: 'condo', name: 'Condomínio', amountCents: 45000, dueDay: 8, expectedAmountCents: 45000, paidBy: testAccountUid(BRUNO), receiptFileId: 'f9' };
const ELECTRICITY_PAYMENT = { ...RENT_PAYMENT, createdAt: new Date('2026-10-10T15:00:00Z'), recurringBillId: 'electricity', name: 'Luz', amountCents: 18735, dueDay: 10, expectedAmountCents: 21000, tagId: UTILITIES_TAG_ID, receiptFileId: 'f10' };
// A Luz do Bruno foi paga com o dia 3 e o previsto de R$ 250,00; a conta de hoje (dia 10, R$ 210,00) mudou depois.
const ALTERED_BILL_PAYMENT = { ...ELECTRICITY_PAYMENT, dueDay: 3, expectedAmountCents: 25000, paidBy: testAccountUid(BRUNO) };
const FRIDGE = { ...base, createdAt: new Date('2026-10-12T15:00:00Z'), month: '2026-10', name: 'Conserto da geladeira', amountCents: 35000, date: '2026-10-12', tagId: HOME_TAG_ID, paidBy: testAccountUid(BRUNO), receiptFileId: 'f11' };
// Para a soma do membro: duas contas do Bruno (R$ 89,90 e R$ 10,10) e uma da Ana de R$ 300,00.
const BAKERY = { ...base, month: '2026-10', name: 'Padaria', amountCents: 1010, date: '2026-10-25', paidBy: testAccountUid(BRUNO), receiptFileId: 'f6' };
const BIG_MARKET = { ...MARKET, amountCents: 30000 };
const NEW_ONE = { ...base, month: '2026-10', name: 'Padaria', amountCents: 1200, date: '2026-10-25', paidBy: testAccountUid(BRUNO), receiptFileId: 'f5' };

// O que a tela recebe: os mesmos campos, sem `createdAt` e `receiptFileId`, e `tagId: null` sem tag.
const toEntry = (id: string, { createdAt: _createdAt, receiptFileId: _receiptFileId, ...entry }: Record<string, unknown>) =>
  ({ id, tagId: null, ...entry }) as IEntry;

const OCTOBER_ENTRIES: IEntry[] = [toEntry('market', MARKET), toEntry('pharmacy', PHARMACY), toEntry('garage', GARAGE)];

export const entryMonthQueryScenarios = {
  // Outubro vem do mais recente ao mais antigo; no mesmo dia, o lançado por último primeiro ("Farmácia" antes de "Estacionamento"). O de setembro fica de fora.
  monthWithEntries: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/pharmacy': PHARMACY,
      'entries/market': MARKET,
      'entries/garage': GARAGE,
      'entries/september': SEPTEMBER,
    },
    input: { month: '2026-10' },
    result: OCTOBER_ENTRIES,
  },
  // O pagamento não tem `date`: entra na ordem pelo `paidOn`, o dia do `createdAt` (15/10), entre o Mercado e a Farmácia.
  monthWithPayment: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/market': MARKET, 'entries/2026-10_internet': INTERNET_PAYMENT },
    input: { month: '2026-10' },
    result: [
      toEntry('market', MARKET),
      toEntry('2026-10_internet', { ...INTERNET_PAYMENT, date: null, paidOn: '2026-10-15' }),
      toEntry('pharmacy', PHARMACY),
    ],
  },
  // O Bruno pagou a Internet por R$ 125,00 (o previsto é R$ 119,90): o pagamento é dele, e a Farmácia também.
  monthWithPaymentOfTheMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/2026-10_internet': BRUNO_INTERNET_PAYMENT },
    input: { month: '2026-10' },
    result: [
      toEntry('2026-10_internet', { ...BRUNO_INTERNET_PAYMENT, date: null, paidOn: '2026-10-15' }),
      toEntry('pharmacy', PHARMACY),
    ],
  },
  // O dia e o previsto do pagamento são os de quando ele foi registrado: a conta mudou depois, e o lançamento não.
  monthWithPaymentOfAlteredBill: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': ALTERED_BILL_PAYMENT },
    input: { month: '2026-10' },
    result: [toEntry('2026-10_electricity', { ...ALTERED_BILL_PAYMENT, date: null, paidOn: '2026-10-10' })],
  },
  // Duas contas do Bruno e uma da Ana: o total do Bruno é a soma das duas (R$ 100,00) contra os R$ 400,00 da família.
  monthWithTwoEntriesOfTheMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/bakery': BAKERY, 'entries/market': BIG_MARKET },
    input: { month: '2026-10' },
    result: [toEntry('bakery', BAKERY), toEntry('market', BIG_MARKET), toEntry('pharmacy', PHARMACY)],
  },
  // O mês do Início: dos mais recentes aos mais antigos, a avulsa do dia 12 e os pagamentos dos dias 10, 8 e 5.
  monthOfTheFamily: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_rent': RENT_PAYMENT,
      'entries/2026-10_condo': CONDO_PAYMENT,
      'entries/2026-10_electricity': ELECTRICITY_PAYMENT,
      'entries/fridge': FRIDGE,
      'entries/september': SEPTEMBER,
    },
    input: { month: '2026-10' },
    result: [
      toEntry('fridge', FRIDGE),
      toEntry('2026-10_electricity', { ...ELECTRICITY_PAYMENT, date: null, paidOn: '2026-10-10' }),
      toEntry('2026-10_condo', { ...CONDO_PAYMENT, date: null, paidOn: '2026-10-08' }),
      toEntry('2026-10_rent', { ...RENT_PAYMENT, date: null, paidOn: '2026-10-05' }),
    ],
  },
  // O mês anterior de quem troca de mês: só o de setembro, com o de outubro (e o da Ana) de fora.
  previousMonthWithEntries: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/market': MARKET, 'entries/september': SEPTEMBER },
    input: { month: '2026-09' },
    result: [toEntry('september', SEPTEMBER)],
  },
  emptyMonth: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/september': SEPTEMBER },
    input: { month: '2026-10' },
    result: [],
  },
  // Um lançamento novo de outubro chega com a lista aberta.
  entryAddedWhileOpen: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY },
    input: { month: '2026-10' },
    result: [toEntry('pharmacy', PHARMACY)],
    afterChange: {
      write: { 'entries/bakery': NEW_ONE },
      result: [toEntry('bakery', NEW_ONE), toEntry('pharmacy', PHARMACY)],
    },
  },
  // O pagamento da Internet chega com a lista aberta: a conta deixa de estar a pagar.
  paymentAddedWhileOpen: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY },
    input: { month: '2026-10' },
    result: [toEntry('pharmacy', PHARMACY)],
    afterChange: {
      write: { 'entries/2026-10_internet': INTERNET_PAYMENT },
      result: [toEntry('2026-10_internet', { ...INTERNET_PAYMENT, date: null, paidOn: '2026-10-15' }), toEntry('pharmacy', PHARMACY)],
    },
  },
} satisfies Record<string, IServiceScenario<{ month: string }, IEntry[]>>;
