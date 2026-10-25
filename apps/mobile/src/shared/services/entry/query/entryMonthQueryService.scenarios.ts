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
const PHARMACY = { ...base, month: '2026-10', name: 'Farmácia', amountCents: 8990, date: '2026-10-12', tagId: HOME_TAG_ID, paidBy: testAccountUid(BRUNO), receiptFileId: 'f1' };
const MARKET = { ...base, month: '2026-10', name: 'Mercado', amountCents: 25000, date: '2026-10-20', tagId: UTILITIES_TAG_ID, paidBy: testAccountUid(ANA), receiptFileId: 'f2' };
const GARAGE = { ...base, month: '2026-10', name: 'Estacionamento', amountCents: 1500, date: '2026-10-12', paidBy: testAccountUid(ANA), receiptFileId: 'f3' };
const SEPTEMBER = { ...base, month: '2026-09', name: 'Gráfica', amountCents: 3000, date: '2026-09-30', paidBy: testAccountUid(BRUNO), receiptFileId: 'f4' };
const NEW_ONE = { ...base, month: '2026-10', name: 'Padaria', amountCents: 1200, date: '2026-10-25', paidBy: testAccountUid(BRUNO), receiptFileId: 'f5' };

// O que a tela recebe: os mesmos campos, sem `createdAt` e `receiptFileId`, e `tagId: null` sem tag.
const toEntry = (id: string, { createdAt: _createdAt, receiptFileId: _receiptFileId, ...entry }: Record<string, unknown>) =>
  ({ id, tagId: null, ...entry }) as IEntry;

const OCTOBER_ENTRIES: IEntry[] = [toEntry('market', MARKET), toEntry('garage', GARAGE), toEntry('pharmacy', PHARMACY)];

export const entryMonthQueryScenarios = {
  // Outubro vem do mais recente ao mais antigo; no mesmo dia, por nome ("Estacionamento" antes de "Farmácia"). O de setembro fica de fora.
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
} satisfies Record<string, IServiceScenario<{ month: string }, IEntry[]>>;
