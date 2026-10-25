import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';

import { addRecurringBillService } from './addRecurringBillService';
import { addRecurringBillScenarios } from './addRecurringBillService.scenarios';

describe('addRecurringBillService', () => {
  it.each(scenarioEntries<[IRecurringBillInput], void>(addRecurringBillScenarios))('Should write the bill of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    expect(await addRecurringBillService(...scenario.input)).toBe(scenario.result);

    // Um documento só, com id gerado e os campos enviados; sem tag, sem o campo `tagId`.
    const [{ tagId, ...bill }] = scenario.input;
    expect(await readCollectionWithoutRules('recurringBills')).toEqual([
      { id: expect.any(String), ...bill, ...(tagId && { tagId }) },
    ]);
  });
});
