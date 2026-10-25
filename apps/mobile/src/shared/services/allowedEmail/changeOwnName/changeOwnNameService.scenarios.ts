import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Bruno está na lista com nome e uid, Carla acabou de entrar.
const BRUNO = 'bruno.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', uid: testAccountUid(BRUNO), isAdmin: false, hasEntries: true },
};

export const changeOwnNameScenarios = {
  memberChangesOwnName: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: [{ email: BRUNO, name: 'Bruno S.' }],
    result: undefined,
  },
  // O login pode vir com maiúsculas; o id do documento é o e-mail em minúsculas.
  memberChangesOwnNameWithCapitals: {
    signedInAs: 'Bruno.Souza@Exemplo.com',
    given: BRUNO_IN_THE_LIST,
    input: [{ email: 'Bruno.Souza@Exemplo.com', name: 'Bruno S.' }],
    result: undefined,
  },
  // A primeira entrada: a Carla não tem nome nem uid, e o app grava o nome da conta Google dela e o uid do login.
  memberGetsGoogleName: {
    signedInAs: CARLA,
    given: { [`allowedEmails/${CARLA}`]: { isAdmin: false, hasEntries: false } },
    input: [{ email: CARLA, name: 'Carla Lima', uid: testAccountUid(CARLA) }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ email: string; name: string; uid?: string }], void>>;
