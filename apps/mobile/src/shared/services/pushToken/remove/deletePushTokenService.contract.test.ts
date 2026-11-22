import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { deletePushTokenService } from './deletePushTokenService';
import { deletePushTokenScenarios } from './deletePushTokenService.scenarios';

describe('deletePushTokenService', () => {
  it.each(scenarioEntries<[string], void>(deletePushTokenScenarios))(
    'Should delete the token of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await deletePushTokenService(...scenario.input)).toBe(scenario.result);

      expect(await readWithoutRules(`pushTokens/${scenario.input[0]}`)).toBeNull();
    },
  );
});
