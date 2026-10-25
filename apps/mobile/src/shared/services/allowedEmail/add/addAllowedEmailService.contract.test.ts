import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { addAllowedEmailService } from './addAllowedEmailService';
import { addAllowedEmailScenarios } from './addAllowedEmailService.scenarios';

describe('addAllowedEmailService', () => {
  it.each(scenarioEntries(addAllowedEmailScenarios))('Should write the person of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    expect(await addAllowedEmailService(...scenario.input)).toBe(scenario.result);

    // A pessoa nasce sem nome nem uid, no id em minúsculas.
    const [{ email }] = scenario.input;
    expect(await readWithoutRules(`allowedEmails/${email.trim().toLowerCase()}`)).toEqual({
      isAdmin: false,
      hasEntries: false,
    });
  });
});
