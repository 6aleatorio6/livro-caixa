import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';

import { oneOffBillTagIdsQueryService } from './oneOffBillTagIdsQueryService';
import { oneOffBillTagIdsQueryScenarios } from './oneOffBillTagIdsQueryService.scenarios';

describe('oneOffBillTagIdsQueryService', () => {
  it.each(scenarioEntries(oneOffBillTagIdsQueryScenarios))('Should deliver what the scenario %s says', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const reading = listenTo(oneOffBillTagIdsQueryService, scenario.input);

    expect(await reading.next()).toEqual(scenario.result);
    if (scenario.afterChange) {
      await writeWithoutRules(scenario.afterChange.write);
      expect(await reading.next()).toEqual(scenario.afterChange.result);
    }
  });
});
