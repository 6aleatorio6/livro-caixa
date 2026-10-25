import type { User } from '@react-native-firebase/auth';

import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import type { signInWithFakeGoogleService } from './signInWithFakeGoogleService';

// As contas de teste das jornadas. O resultado é a parte do usuário que as telas leem; o uid é o fixo
// da conta de teste, que o contrato cria no emulador antes da entrada.
export const signInWithFakeGoogleScenarios = {
  adminSignsIn: {
    signedInAs: null,
    given: {},
    input: [{ email: 'ana.souza@exemplo.com', name: 'Ana Souza' }],
    result: {
      uid: testAccountUid('ana.souza@exemplo.com'),
      email: 'ana.souza@exemplo.com',
      displayName: 'Ana Souza',
      emailVerified: true,
    },
  },
  memberSignsIn: {
    signedInAs: null,
    given: {},
    input: [{ email: 'bruno.souza@exemplo.com', name: 'Bruno Souza' }],
    result: {
      uid: testAccountUid('bruno.souza@exemplo.com'),
      email: 'bruno.souza@exemplo.com',
      displayName: 'Bruno Souza',
      emailVerified: true,
    },
  },
  outsiderSignsIn: {
    signedInAs: null,
    given: {},
    input: [{ email: 'carla.lima@exemplo.com', name: 'Carla Lima' }],
    result: {
      uid: testAccountUid('carla.lima@exemplo.com'),
      email: 'carla.lima@exemplo.com',
      displayName: 'Carla Lima',
      emailVerified: true,
    },
  },
} satisfies Record<
  string,
  IServiceScenario<
    Parameters<typeof signInWithFakeGoogleService>,
    Pick<User, 'uid' | 'email' | 'displayName' | 'emailVerified'>
  >
>;
