import { Bytes } from 'firebase/firestore';

import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import { createAuthAccount } from './createAuthAccount';
import { RECEIPT_FIXTURE } from './fixtures/receiptFixture';
import { writeWithoutRules } from './writeWithoutRules';

/**
 * Deixa o banco e a sessão como o cenário diz, pelo mesmo login de teste das jornadas, numa conta que já nasce
 * com o uid fixo da pessoa.
 */
export async function arrangeScenario(
  scenario: Pick<IServiceScenario<unknown, unknown>, 'signedInAs' | 'given' | 'fileContentsGiven'>,
) {
  const { signedInAs } = scenario;
  const contents = Object.fromEntries(
    (scenario.fileContentsGiven ?? []).map((id) => [
      `fileContents/${id}`,
      { content: Bytes.fromUint8Array(RECEIPT_FIXTURE.bytes) },
    ]),
  );
  await Promise.all([writeWithoutRules({ ...scenario.given, ...contents }), signedInAs && signInAs(signedInAs)]);
}

async function signInAs(email: string) {
  const account = { email, name: email };
  await createAuthAccount(account);
  await signInWithFakeGoogleService(account);
}
