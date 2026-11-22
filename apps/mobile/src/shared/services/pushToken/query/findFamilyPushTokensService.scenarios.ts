import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana (admin) envia, Bruno e Clara são membros.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const CLARA = 'clara.souza@exemplo.com';
const BRUNO_TOKEN = 'ExponentPushToken[celular-do-bruno]';
const FAMILY = {
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', uid: testAccountUid(ANA), isAdmin: true, hasEntries: false },
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', uid: testAccountUid(BRUNO), isAdmin: false, hasEntries: true },
  [`allowedEmails/${CLARA}`]: { name: 'Clara Souza', uid: testAccountUid(CLARA), isAdmin: false, hasEntries: false },
};

interface IFamilyPushTokens {
  senderName: string;
  tokens: string[];
}

export const findFamilyPushTokensScenarios = {
  // A Ana envia: voltam o celular da Clara e o do Bruno (o Firestore os entrega por id), nunca o dela nem o de quem já saiu da lista.
  anaSendsToTheRestOfTheFamily: {
    signedInAs: ANA,
    given: {
      ...FAMILY,
      'pushTokens/ExponentPushToken[celular-da-ana]': { uid: testAccountUid(ANA) },
      [`pushTokens/${BRUNO_TOKEN}`]: { uid: testAccountUid(BRUNO) },
      'pushTokens/ExponentPushToken[celular-da-clara]': { uid: testAccountUid(CLARA) },
      'pushTokens/ExponentPushToken[celular-de-quem-saiu]': { uid: testAccountUid('davi.souza@exemplo.com') },
    },
    input: [testAccountUid(ANA)],
    result: { senderName: 'Ana', tokens: ['ExponentPushToken[celular-da-clara]', BRUNO_TOKEN] },
  },
  // Só a Ana tem celular: ninguém mais para avisar.
  nobodyElseHasAPhone: {
    signedInAs: ANA,
    given: { ...FAMILY, 'pushTokens/ExponentPushToken[celular-da-ana]': { uid: testAccountUid(ANA) } },
    input: [testAccountUid(ANA)],
    result: { senderName: 'Ana', tokens: [] },
  },
} satisfies Record<string, IServiceScenario<[string], IFamilyPushTokens>>;
