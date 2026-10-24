import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

export const signOutScenarios = {
  memberSignsOut: {
    signedInAs: 'bruno.souza@exemplo.com',
    given: {},
    input: [],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[], void>>;
