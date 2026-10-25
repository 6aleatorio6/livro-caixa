import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import { createAuthAccount } from './createAuthAccount';
import { writeWithoutRules } from './writeWithoutRules';

/**
 * Deixa o banco e a sessão como o cenário diz, pelo mesmo login de teste das jornadas, numa conta
 * que já nasce com o uid fixo da pessoa.
 */
export async function arrangeScenario(scenario: Pick<IServiceScenario<unknown, unknown>, 'signedInAs' | 'given'>) {
  const { signedInAs } = scenario;
  await Promise.all([writeWithoutRules(scenario.given), signedInAs && signInAs(signedInAs)]);
}

async function signInAs(email: string) {
  const account = { email, name: email };
  await createAuthAccount(account);
  await signInWithFakeGoogleService(account);
}
