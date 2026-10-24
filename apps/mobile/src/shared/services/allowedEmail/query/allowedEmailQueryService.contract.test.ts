import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';

import { allowedEmailQueryService } from './allowedEmailQueryService';
import { allowedEmailQueryScenarios } from './allowedEmailQueryService.scenarios';

describe('allowedEmailQueryService', () => {
  it.each(scenarioEntries(allowedEmailQueryScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const reading = listenTo(allowedEmailQueryService, scenario.input);

      expect(await reading.next()).toEqual(scenario.result);
      if (scenario.afterChange) {
        await writeWithoutRules(scenario.afterChange.write);
        expect(await reading.next()).toEqual(scenario.afterChange.result);
      }
    },
  );

  // Sem sessão, o `useRealtime` fica parado (`idle`), e o teste de página mocka esse estado.
  it('Should not read anything while there is no e-mail', () => {
    expect(allowedEmailQueryService.refs({ email: null })).toEqual([]);
  });
});
