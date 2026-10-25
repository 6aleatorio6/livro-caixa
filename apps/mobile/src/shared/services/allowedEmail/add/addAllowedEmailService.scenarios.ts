import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: a Ana é admin e já entrou, então tem nome.
const ANA = 'ana.souza@exemplo.com';
const ANA_IN_THE_LIST = { [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: false } };

export const addAllowedEmailScenarios = {
  // O que a tela envia: só o e-mail, já aparado pelo formulário; o id do documento é o e-mail em
  // minúsculas, e a Carla nasce sem nome.
  adminAddsCarla: {
    signedInAs: ANA,
    given: ANA_IN_THE_LIST,
    input: [{ email: 'Carla.Lima@Exemplo.com' }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ email: string }], void>>;
