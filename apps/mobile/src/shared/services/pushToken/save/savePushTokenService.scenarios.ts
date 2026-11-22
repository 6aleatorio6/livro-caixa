import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro.
const BRUNO = 'bruno.souza@exemplo.com';

export const SAVED_PUSH_TOKEN = 'ExponentPushToken[celular-do-bruno]';

export const savePushTokenScenarios = {
  memberSavesTheTokenOfThePhone: {
    signedInAs: BRUNO,
    given: { [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false } },
    input: [SAVED_PUSH_TOKEN],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[string], void>>;
