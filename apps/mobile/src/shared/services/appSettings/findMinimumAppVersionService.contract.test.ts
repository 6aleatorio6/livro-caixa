import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { findMinimumAppVersionService } from './findMinimumAppVersionService';
import { findMinimumAppVersionScenarios } from './findMinimumAppVersionService.scenarios';

describe('findMinimumAppVersionService', () => {
  it.each(scenarioEntries<[], string | null>(findMinimumAppVersionScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await findMinimumAppVersionService(...scenario.input)).toBe(scenario.result);
    },
  );
});
