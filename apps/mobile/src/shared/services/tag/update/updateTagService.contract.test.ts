import type { ITag } from '@/shared/types/tag/Tag';
import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { THREE_TAGS_DOCUMENT } from '@/shared/testing/tagFixtures';

import { updateTagService } from './updateTagService';
import { updateTagRejectedScenarios, updateTagScenarios } from './updateTagService.scenarios';

describe('updateTagService', () => {
  it.each(scenarioEntries<[Pick<ITag, 'id' | 'name' | 'color'>], ITag>(updateTagScenarios))('Should write the tag of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    expect(await updateTagService(...scenario.input)).toEqual(scenario.result);

    // Só o item da tag muda; os outros ficam como estavam.
    const { id, ...item } = scenario.result;
    expect(await readWithoutRules('settings/tags')).toEqual({
      items: { ...THREE_TAGS_DOCUMENT.items, [id]: item },
    });
  });

  it.each(scenarioEntries<[Pick<ITag, 'id' | 'name' | 'color'>], { code: string; userMessage: string }>(updateTagRejectedScenarios))(
    'Should refuse the tag of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const refusal = updateTagService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada é gravado.
      expect(await readWithoutRules('settings/tags')).toEqual(scenario.given['settings/tags']);
    },
  );
});
