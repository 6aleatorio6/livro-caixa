import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';
import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import type { IEntry } from '@/shared/types/entry/Entry';

import { overdueSourcesQueryService } from './overdueSourcesQueryService';
import { overdueSourcesQueryScenarios } from './overdueSourcesQueryService.scenarios';

describe('overdueSourcesQueryService', () => {
  it.each(
    scenarioEntries<{ currentMonth: string }, { entries: IEntry[]; billMonths: IBillMonth[] }>(
      overdueSourcesQueryScenarios,
    ),
  )('Should deliver what the scenario %s says', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const reading = listenTo(overdueSourcesQueryService, scenario.input);

    expect(await reading.next()).toEqual(scenario.result);
    if (scenario.afterChange) {
      await writeWithoutRules(scenario.afterChange.write);
      expect(await reading.next()).toEqual(scenario.afterChange.result);
    }
  });
});
