import type { ITag } from '@/shared/types/tag/Tag';
import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { createTagService } from './createTagService';
import { createTagRejectedScenarios, createTagScenarios } from './createTagService.scenarios';

/** Os itens de `settings/tags` antes do cenário. */
function givenItems(given: Record<string, object>) {
  return (given['settings/tags'] as { items: object } | undefined)?.items ?? {};
}

describe('createTagService', () => {
  it.each(scenarioEntries<[Pick<ITag, 'name' | 'color'>], Omit<ITag, 'id'>>(createTagScenarios))('Should write the tag of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const created = await createTagService(...scenario.input);

    expect(created).toMatchObject(scenario.result);
    // Os itens que já havia ficam como estavam, e a tag nova entra com o id gerado.
    const { id, ...item } = created;
    expect(await readWithoutRules('settings/tags')).toEqual({ items: { ...givenItems(scenario.given), [id]: item } });
  });

  it.each(scenarioEntries<[Pick<ITag, 'name' | 'color'>], { code: string; userMessage: string }>(createTagRejectedScenarios))(
    'Should refuse the tag of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const refusal = createTagService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada é gravado.
      expect(await readWithoutRules('settings/tags')).toEqual(scenario.given['settings/tags']);
    },
  );
});
