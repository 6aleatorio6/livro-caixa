import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_TOKEN = 'ExponentPushToken[celular-do-bruno]';

export const deletePushTokenScenarios = {
  memberDeletesTheTokenOfThePhone: {
    signedInAs: BRUNO,
    given: {
      [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
      [`pushTokens/${BRUNO_TOKEN}`]: { uid: testAccountUid(BRUNO) },
    },
    input: [BRUNO_TOKEN],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[string], void>>;
