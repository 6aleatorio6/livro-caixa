import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};
const bill = (name: string, tagId?: string) => ({
  kind: 'oneOffBill',
  month: '2026-10',
  name,
  amountCents: 1000,
  date: '2026-10-12',
  ...(tagId && { tagId }),
  paidBy: 'uid-x',
  createdAt: new Date('2026-10-20T12:00:00Z'),
  receiptFileId: 'f',
});

export const oneOffBillTagIdsQueryScenarios = {
  // Duas contas na mesma tag contam duas vezes; a sem tag não entra. A leitura vem na ordem do id do documento.
  oneOffBillsWithTags: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_IN_THE_LIST,
      'entries/a': bill('Farmácia', HOME_TAG_ID),
      'entries/b': bill('Mercado', HOME_TAG_ID),
      'entries/c': bill('Luz extra', UTILITIES_TAG_ID),
      'entries/d': bill('Gráfica'),
    },
    input: {},
    result: [HOME_TAG_ID, HOME_TAG_ID, UTILITIES_TAG_ID],
  },
  noOneOffBills: { signedInAs: BRUNO, given: BRUNO_IN_THE_LIST, input: {}, result: [] },
} satisfies Record<string, IServiceScenario<object, string[]>>;
