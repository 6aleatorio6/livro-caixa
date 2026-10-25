import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { removeAllowedEmailService } from './removeAllowedEmailService';
import { removeAllowedEmailScenarios } from './removeAllowedEmailService.scenarios';

describe('removeAllowedEmailService', () => {
  it.each(scenarioEntries(removeAllowedEmailScenarios))(
    'Should delete the person of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await removeAllowedEmailService(...scenario.input)).toBe(scenario.result);

      expect(await readWithoutRules(`allowedEmails/${scenario.input[0].email}`)).toBeNull();
    },
  );
});
