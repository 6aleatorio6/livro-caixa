import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { removeRecurringBillService } from './removeRecurringBillService';
import { removeRecurringBillScenarios } from './removeRecurringBillService.scenarios';

describe('removeRecurringBillService', () => {
  it.each(scenarioEntries(removeRecurringBillScenarios))(
    'Should delete the bill of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await removeRecurringBillService(...scenario.input)).toBe(scenario.result);

      // Só a conta pedida some; as outras ficam.
      const [{ id }] = scenario.input;
      expect(await readWithoutRules(`recurringBills/${id}`)).toBeNull();
      expect(await readCollectionWithoutRules('recurringBills')).toHaveLength(
        Object.keys(scenario.given).filter((path) => path.startsWith('recurringBills/')).length - 1,
      );
    },
  );
});
