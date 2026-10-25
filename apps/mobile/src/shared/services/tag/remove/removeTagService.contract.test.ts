import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { removeTagService } from './removeTagService';
import { removeTagScenarios } from './removeTagService.scenarios';

describe('removeTagService', () => {
  it.each(scenarioEntries(removeTagScenarios))('Should delete the tag of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    expect(await removeTagService(...scenario.input)).toBe(scenario.result);

    // Só o item pedido some; os outros ficam, e o documento também.
    const [{ id }] = scenario.input;
    const { items } = scenario.given['settings/tags'] as { items: Record<string, object> };
    expect(await readWithoutRules('settings/tags')).toEqual({
      items: Object.fromEntries(Object.entries(items).filter(([key]) => key !== id)),
    });
  });
});
