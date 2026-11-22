import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { findFamilyPushTokensService } from './findFamilyPushTokensService';
import { findFamilyPushTokensScenarios } from './findFamilyPushTokensService.scenarios';

describe('findFamilyPushTokensService', () => {
  it.each(scenarioEntries<[string], { senderName: string; tokens: string[] }>(findFamilyPushTokensScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await findFamilyPushTokensService(...scenario.input)).toEqual(scenario.result);
    },
  );
});
