import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';

import { overdueMonthQueryService } from './overdueMonthQueryService';
import { overdueMonthQueryScenarios } from './overdueMonthQueryService.scenarios';

describe('overdueMonthQueryService', () => {
  it.each(scenarioEntries(overdueMonthQueryScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const reading = listenTo(overdueMonthQueryService, scenario.input);

      expect(await reading.next()).toEqual(scenario.result);
      if (scenario.afterChange) {
        await writeWithoutRules(scenario.afterChange.write);
        expect(await reading.next()).toEqual(scenario.afterChange.result);
      }
    },
  );
});
