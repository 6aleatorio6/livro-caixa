import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { changeOwnNameService } from './changeOwnNameService';
import { changeOwnNameScenarios } from './changeOwnNameService.scenarios';

describe('changeOwnNameService', () => {
  it.each(scenarioEntries<Parameters<typeof changeOwnNameService>, void>(changeOwnNameScenarios))(
    'Should write the name of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ email, name, uid }] = scenario.input;

      expect(await changeOwnNameService(...scenario.input)).toBe(scenario.result);

      // O documento inteiro, pelo id em minúsculas: o nome novo (e o uid, se veio), e os outros campos como estavam.
      const path = `allowedEmails/${allowedEmailId(email)}`;
      expect(await readWithoutRules(path)).toEqual({
        ...(scenario.given as Record<string, object>)[path],
        ...(name && { name }),
        ...(uid && { uid }),
      });
    },
  );
});
