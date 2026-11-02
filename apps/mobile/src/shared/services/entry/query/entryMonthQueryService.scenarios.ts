import {
  CONTRIBUTION,
  CONTRIBUTION_DOCUMENT,
  CONTRIBUTION_TO_UNOWNED,
  CONTRIBUTION_TO_UNOWNED_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  UNOWNED_PAYMENT,
  UNOWNED_PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
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
// O Condomínio de novembro, pago pelo Bruno em 28 de outubro: conta em novembro, o mês da conta, e não no mês em que foi pago.
const EARLY_CONDO_PAYMENT = { ...CONDO_PAYMENT, createdAt: new Date('2026-10-28T15:00:00Z'), month: '2026-11', receiptFileId: 'f12' };
// Para a soma do membro: duas contas do Bruno (R$ 89,90 e R$ 10,10) e uma da Ana de R$ 300,00.
const BAKERY = { ...base, month: '2026-10', name: 'Padaria', amountCents: 1010, date: '2026-10-25', paidBy: testAccountUid(BRUNO), receiptFileId: 'f6' };
const BIG_MARKET = { ...MARKET, amountCents: 30000 };
const NEW_ONE = { ...base, month: '2026-10', name: 'Padaria', amountCents: 1200, date: '2026-10-25', paidBy: testAccountUid(BRUNO), receiptFileId: 'f5' };

// O exemplo de novembro: o Aluguel pago só pelas contribuições de Bruno e Carla, a Internet paga pela Ana com R$ 40,00
// do Bruno, a Luz ainda a pagar com R$ 100,00 da Ana, e a Farmácia da Ana com R$ 30,00 da Carla.
const CARLA_UID = testAccountUid('carla.lima@exemplo.com');
const november = (day: string) => new Date(`2026-11-${day}T12:00:00Z`);
const UNOWNED_RENT = {
  kind: 'recurringPayment',
  createdAt: november('04'),
  month: '2026-11',
  recurringBillId: 'rent',
  name: 'Aluguel',
  dueDay: 10,
  expectedAmountCents: 200000,
  tagId: HOME_TAG_ID,
};
const UNOWNED_ELECTRICITY = {
  ...UNOWNED_RENT,
  createdAt: november('08'),
  recurringBillId: 'electricity',
  name: 'Luz',
  dueDay: 20,
  expectedAmountCents: 20000,
};
const NOVEMBER_INTERNET = {
  ...INTERNET_PAYMENT,
  createdAt: november('15'),
  month: '2026-11',
  amountCents: 12000,
  expectedAmountCents: 12000,
  receiptFileId: 'f21',
};
const NOVEMBER_PHARMACY = {
  ...PHARMACY,
  createdAt: november('12'),
  month: '2026-11',
  amountCents: 8000,
  date: '2026-11-12',
  paidBy: testAccountUid(ANA),
  receiptFileId: 'f26',
};
const contribution = (createdAt: Date, entryId: string, amountCents: number, paidBy: string, receiptFileId: string) =>
  ({ kind: 'contribution', createdAt, month: '2026-11', entryId, amountCents, paidBy, receiptFileId }) as const;
const BRUNO_ON_RENT = contribution(november('04'), '2026-11_rent', 100000, testAccountUid(BRUNO), 'f22');
const CARLA_ON_RENT = contribution(november('05'), '2026-11_rent', 100000, CARLA_UID, 'f23');
const BRUNO_ON_INTERNET = contribution(november('16'), '2026-11_internet', 4000, testAccountUid(BRUNO), 'f24');
const ANA_ON_ELECTRICITY = contribution(november('08'), '2026-11_electricity', 10000, testAccountUid(ANA), 'f25');
const CARLA_ON_PHARMACY = contribution(november('13'), 'pharmacy', 3000, CARLA_UID, 'f27');

// O que a tela recebe: os mesmos campos, sem `createdAt`, e `tagId: null` sem tag.
const toEntry = (id: string, { createdAt: _createdAt, ...entry }: Record<string, unknown>) =>
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
  // O próximo mês, pago antes de começar: só o Condomínio de novembro, com o dia em que foi pago; a Farmácia, de outubro, fica de fora.
  nextMonthPaidEarly: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/2026-11_condo': EARLY_CONDO_PAYMENT },
    input: { month: '2026-11' },
    result: [toEntry('2026-11_condo', { ...EARLY_CONDO_PAYMENT, date: null, paidOn: '2026-10-28' })],
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
  // O autor exclui o pagamento da Internet com a lista aberta: a conta volta a estar a pagar.
  paymentDeletedWhileOpen: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/2026-10_internet': INTERNET_PAYMENT },
    input: { month: '2026-10' },
    result: [toEntry('2026-10_internet', { ...INTERNET_PAYMENT, date: null, paidOn: '2026-10-15' }), toEntry('pharmacy', PHARMACY)],
    afterChange: { write: { 'entries/2026-10_internet': null }, result: [toEntry('pharmacy', PHARMACY)] },
  },
  // Os quatro tipos de lançamento, do mais recente para o mais antigo; o pagamento sem dono e a contribuição do mesmo
  // lote têm a mesma hora e ficam na ordem do id. A contribuição chega com o `entryId` e sem nome nem tag; o
  // pagamento sem dono, com quem pagou, o valor e o comprovante em `null`.
  monthWithContributions: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-11_rent': UNOWNED_RENT,
      'entries/k3J9': BRUNO_ON_RENT,
      'entries/p8Q2': CARLA_ON_RENT,
      'entries/2026-11_internet': NOVEMBER_INTERNET,
      'entries/m1X7': BRUNO_ON_INTERNET,
      'entries/2026-11_electricity': UNOWNED_ELECTRICITY,
      'entries/t6R1': ANA_ON_ELECTRICITY,
      'entries/pharmacy': NOVEMBER_PHARMACY,
      'entries/c2W4': CARLA_ON_PHARMACY,
    },
    input: { month: '2026-11' },
    result: [
      {
        id: 'm1X7',
        kind: 'contribution',
        month: '2026-11',
        entryId: '2026-11_internet',
        amountCents: 4000,
        paidBy: testAccountUid(BRUNO),
        receiptFileId: 'f24',
        paidOn: '2026-11-16',
      },
      toEntry('2026-11_internet', { ...NOVEMBER_INTERNET, date: null, paidOn: '2026-11-15' }),
      {
        id: 'c2W4',
        kind: 'contribution',
        month: '2026-11',
        entryId: 'pharmacy',
        amountCents: 3000,
        paidBy: CARLA_UID,
        receiptFileId: 'f27',
        paidOn: '2026-11-13',
      },
      toEntry('pharmacy', NOVEMBER_PHARMACY),
      toEntry('2026-11_electricity', {
        ...UNOWNED_ELECTRICITY,
        date: null,
        paidOn: '2026-11-08',
        paidBy: null,
        amountCents: null,
        receiptFileId: null,
      }),
      {
        id: 't6R1',
        kind: 'contribution',
        month: '2026-11',
        entryId: '2026-11_electricity',
        amountCents: 10000,
        paidBy: testAccountUid(ANA),
        receiptFileId: 'f25',
        paidOn: '2026-11-08',
      },
      {
        id: 'p8Q2',
        kind: 'contribution',
        month: '2026-11',
        entryId: '2026-11_rent',
        amountCents: 100000,
        paidBy: CARLA_UID,
        receiptFileId: 'f23',
        paidOn: '2026-11-05',
      },
      toEntry('2026-11_rent', {
        ...UNOWNED_RENT,
        date: null,
        paidOn: '2026-11-04',
        paidBy: null,
        amountCents: null,
        receiptFileId: null,
      }),
      {
        id: 'k3J9',
        kind: 'contribution',
        month: '2026-11',
        entryId: '2026-11_rent',
        amountCents: 100000,
        paidBy: testAccountUid(BRUNO),
        receiptFileId: 'f22',
        paidOn: '2026-11-04',
      },
    ],
  },
  // A Luz que o Bruno pagou, com a contribuição de R$ 40,00 da Ana, registrada no dia seguinte: vem primeiro.
  monthWithContributionToPayment: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      'entries/c-ana': CONTRIBUTION_DOCUMENT,
    },
    input: { month: '2026-10' },
    result: [CONTRIBUTION, PAYMENT],
  },
  // A Luz do Bruno já recebeu da Ana tudo o que ele pagou: não falta nada.
  monthWithFullyContributedPayment: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      'entries/c-ana': { ...CONTRIBUTION_DOCUMENT, amountCents: PAYMENT_DOCUMENT.amountCents },
    },
    input: { month: '2026-10' },
    result: [{ ...CONTRIBUTION, amountCents: PAYMENT_DOCUMENT.amountCents }, PAYMENT],
  },
  // A Internet de outubro sem dono, com a contribuição de R$ 50,00 da Ana, registrada dois dias depois: vem primeiro.
  monthWithContributionToUnownedPayment: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': CONTRIBUTION_TO_UNOWNED_DOCUMENT,
    },
    input: { month: '2026-10' },
    result: [CONTRIBUTION_TO_UNOWNED, UNOWNED_PAYMENT],
  },
  // Um `kind` que o app não conhece (gravado por uma versão mais nova) não aparece como conta avulsa: fica de fora.
  monthWithUnknownKind: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/pharmacy': PHARMACY, 'entries/refund': { ...MARKET, kind: 'refund' } },
    input: { month: '2026-10' },
    result: [toEntry('pharmacy', PHARMACY)],
  },
} satisfies Record<string, IServiceScenario<{ month: string }, IEntry[]>>;
