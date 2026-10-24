import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Bruno está na lista, Carla não.
const BRUNO = 'bruno.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const BRUNO_IN_THE_LIST = { [`allowedEmails/${BRUNO}`]: { isAdmin: false, hasEntries: false } };

export const allowedEmailQueryScenarios = {
  emailInList: { signedInAs: BRUNO, given: BRUNO_IN_THE_LIST, input: { email: BRUNO }, result: true },
  // A regra deixa ler o documento do próprio e-mail mesmo quando ele não existe: vem `false`, e não erro.
  emailOutsideList: { signedInAs: CARLA, given: BRUNO_IN_THE_LIST, input: { email: CARLA }, result: false },
  // O id na lista é o e-mail em minúsculas, e o do login pode vir com maiúsculas.
  emailWithCapitals: {
    signedInAs: 'Bruno.Souza@Exemplo.com',
    given: BRUNO_IN_THE_LIST,
    input: { email: 'Bruno.Souza@Exemplo.com' },
    result: true,
  },
  emailRemovedWhileOpen: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: { email: BRUNO },
    result: true,
    afterChange: { write: { [`allowedEmails/${BRUNO}`]: null }, result: false },
  },
} satisfies Record<string, IServiceScenario<{ email: string | null }, boolean>>;
