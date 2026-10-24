import type { IAllowedEmail } from '@/shared/types/allowedEmail/AllowedEmail';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana (admin) e Bruno estão na lista, Carla não.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const ANA_PERSON = { name: 'Ana Souza', isAdmin: true };
const ANA_AS_MEMBER = { ...ANA_PERSON, isAdmin: false };
const BRUNO_PERSON = { name: 'Bruno Souza', isAdmin: false };
const CARLA_PERSON = { name: 'Carla Lima', isAdmin: false };
const ANA_IN_THE_LIST = { [`allowedEmails/${ANA}`]: { ...ANA_PERSON, hasEntries: false } };
const BRUNO_IN_THE_LIST = { [`allowedEmails/${BRUNO}`]: { ...BRUNO_PERSON, hasEntries: false } };

export const allowedEmailQueryScenarios = {
  emailInList: { signedInAs: BRUNO, given: BRUNO_IN_THE_LIST, input: { email: BRUNO }, result: BRUNO_PERSON },
  adminInList: { signedInAs: ANA, given: ANA_IN_THE_LIST, input: { email: ANA }, result: ANA_PERSON },
  // A regra deixa ler o documento do próprio e-mail mesmo quando ele não existe: vem `null`, e não erro.
  emailOutsideList: { signedInAs: CARLA, given: BRUNO_IN_THE_LIST, input: { email: CARLA }, result: null },
  // O id na lista é o e-mail em minúsculas, e o do login pode vir com maiúsculas.
  emailWithCapitals: {
    signedInAs: 'Bruno.Souza@Exemplo.com',
    given: BRUNO_IN_THE_LIST,
    input: { email: 'Bruno.Souza@Exemplo.com' },
    result: BRUNO_PERSON,
  },
  emailRemovedWhileOpen: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: { email: BRUNO },
    result: BRUNO_PERSON,
    afterChange: { write: { [`allowedEmails/${BRUNO}`]: null }, result: null },
  },
  // Quem espera em "Aguardando permissão" é liberada quando o e-mail entra na lista.
  emailAddedWhileOpen: {
    signedInAs: CARLA,
    given: BRUNO_IN_THE_LIST,
    input: { email: CARLA },
    result: null,
    afterChange: {
      write: { [`allowedEmails/${CARLA}`]: { ...CARLA_PERSON, hasEntries: false } },
      result: CARLA_PERSON,
    },
  },
  adminLosesAdminWhileOpen: {
    signedInAs: ANA,
    given: ANA_IN_THE_LIST,
    input: { email: ANA },
    result: ANA_PERSON,
    afterChange: {
      write: { [`allowedEmails/${ANA}`]: { ...ANA_AS_MEMBER, hasEntries: false } },
      result: ANA_AS_MEMBER,
    },
  },
} satisfies Record<string, IServiceScenario<{ email: string | null }, IAllowedEmail | null>>;
