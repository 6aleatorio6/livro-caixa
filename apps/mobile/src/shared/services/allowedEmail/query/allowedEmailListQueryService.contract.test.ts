import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';

import { allowedEmailListQueryService } from './allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from './allowedEmailListQueryService.scenarios';

describe('allowedEmailListQueryService', () => {
  it.each(scenarioEntries(allowedEmailListQueryScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const reading = listenTo(allowedEmailListQueryService, scenario.input);

      expect(await reading.next()).toEqual(scenario.result);
      if (scenario.afterChange) {
        await writeWithoutRules(scenario.afterChange.write);
        expect(await reading.next()).toEqual(scenario.afterChange.result);
      }
    },
  );
});
