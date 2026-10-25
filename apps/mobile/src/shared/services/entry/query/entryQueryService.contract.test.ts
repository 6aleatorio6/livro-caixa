import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';
import type { IEntry } from '@/shared/types/entry/Entry';

import { entryQueryService } from './entryQueryService';
import { entryQueryScenarios } from './entryQueryService.scenarios';

describe('entryQueryService', () => {
  it.each(scenarioEntries<{ id: string }, IEntry | null>(entryQueryScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const reading = listenTo(entryQueryService, scenario.input);

      expect(await reading.next()).toEqual(scenario.result);
      if (scenario.afterChange) {
        await writeWithoutRules(scenario.afterChange.write);
        expect(await reading.next()).toEqual(scenario.afterChange.result);
      }
    },
  );
});
