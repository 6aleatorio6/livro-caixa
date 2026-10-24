import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

const ANA = 'ana.souza@exemplo.com';
const ANA_IN_THE_LIST = { [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: false } };

export const addAllowedEmailScenarios = {
  // O que a tela envia: o nome já aparado pelo formulário; o id do documento é o e-mail em minúsculas.
  adminAddsCarla: {
    signedInAs: ANA,
    given: ANA_IN_THE_LIST,
    input: [{ name: 'Carla Lima', email: 'Carla.Lima@Exemplo.com' }],
    result: undefined,
  },
  // Só do contrato: o serviço também apara o nome, para quem o chamar sem passar pelo formulário.
  adminAddsNameWithSpaces: {
    signedInAs: ANA,
    given: ANA_IN_THE_LIST,
    input: [{ name: ' Carla Lima ', email: 'carla.lima@exemplo.com' }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ name: string; email: string }], void>>;
