import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { changeOwnNameService } from './changeOwnNameService';
import { changeOwnNameScenarios } from './changeOwnNameService.scenarios';

describe('changeOwnNameService', () => {
  it.each(scenarioEntries(changeOwnNameScenarios))(
    'Should write the name of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      // O `uid` só vem na primeira entrada; o tipo geral da lista de cenários não o conhece.
      const [{ email, name, uid }] = scenario.input as Parameters<typeof changeOwnNameService>;

      expect(await changeOwnNameService(...scenario.input)).toBe(scenario.result);

      // O documento inteiro, pelo id em minúsculas: o nome novo (e o uid, se veio), e os outros campos como estavam.
      const path = `allowedEmails/${allowedEmailId(email)}`;
      expect(await readWithoutRules(path)).toEqual({
        ...(scenario.given as Record<string, object>)[path],
        name,
        ...(uid && { uid }),
      });
    },
  );
});
