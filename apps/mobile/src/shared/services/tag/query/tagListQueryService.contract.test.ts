import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';

import { tagListQueryService } from './tagListQueryService';
import { tagListQueryScenarios } from './tagListQueryService.scenarios';

describe('tagListQueryService', () => {
  it.each(scenarioEntries(tagListQueryScenarios))('Should deliver what the scenario %s says', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const reading = listenTo(tagListQueryService, scenario.input);

    expect(await reading.next()).toEqual(scenario.result);
    if (scenario.afterChange) {
      await writeWithoutRules(scenario.afterChange.write);
      expect(await reading.next()).toEqual(scenario.afterChange.result);
    }
  });
});
