import { signOut } from '@react-native-firebase/auth';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { createAuthAccount } from '@/shared/testing/contract/createAuthAccount';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { signInWithFakeGoogleService } from './signInWithFakeGoogleService';
import { signInWithFakeGoogleScenarios } from './signInWithFakeGoogleService.scenarios';

describe('signInWithFakeGoogleService', () => {
  it.each(scenarioEntries(signInWithFakeGoogleScenarios))(
    'Should return what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      await createAuthAccount(scenario.input[0]);

      expect(await signInWithFakeGoogleService(...scenario.input)).toMatchObject(scenario.result);
    },
  );

  it('Should bring the same account back with the same uid', async () => {
    const { input } = signInWithFakeGoogleScenarios.memberSignsIn;
    const firstUser = await signInWithFakeGoogleService(...input);
    await signOut(firebaseAuth);

    const secondUser = await signInWithFakeGoogleService(...input);

    expect(secondUser.uid).toBe(firstUser.uid);
  });
});
