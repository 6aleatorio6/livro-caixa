import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import { writeWithoutRules } from './writeWithoutRules';

/** Deixa o banco e a sessão como o cenário diz, pelo mesmo login de teste das jornadas. */
export async function arrangeScenario(scenario: Pick<IServiceScenario<unknown, unknown>, 'signedInAs' | 'given'>) {
  const { signedInAs } = scenario;
  await Promise.all([
    writeWithoutRules(scenario.given),
    signedInAs && signInWithFakeGoogleService({ email: signedInAs, name: signedInAs }),
  ]);
}
