import type { User } from '@react-native-firebase/auth';

import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import type { signInWithFakeGoogleService } from './signInWithFakeGoogleService';

// As contas de teste das jornadas. O resultado é a parte do usuário que as telas leem.
export const signInWithFakeGoogleScenarios = {
  memberSignsIn: {
    signedInAs: null,
    given: {},
    input: [{ email: 'bruno.souza@exemplo.com', name: 'Bruno Souza' }],
    result: { email: 'bruno.souza@exemplo.com', displayName: 'Bruno Souza', emailVerified: true },
  },
  outsiderSignsIn: {
    signedInAs: null,
    given: {},
    input: [{ email: 'carla.lima@exemplo.com', name: 'Carla Lima' }],
    result: { email: 'carla.lima@exemplo.com', displayName: 'Carla Lima', emailVerified: true },
  },
} satisfies Record<
  string,
  IServiceScenario<
    Parameters<typeof signInWithFakeGoogleService>,
    Pick<User, 'email' | 'displayName' | 'emailVerified'>
  >
>;
