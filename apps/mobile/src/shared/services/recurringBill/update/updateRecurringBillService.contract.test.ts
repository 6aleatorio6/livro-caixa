import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { updateRecurringBillService } from './updateRecurringBillService';
import { updateRecurringBillRejectedScenarios, updateRecurringBillScenarios } from './updateRecurringBillService.scenarios';

describe('updateRecurringBillService', () => {
  it.each(scenarioEntries(updateRecurringBillScenarios))(
    'Should write the bill of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await updateRecurringBillService(...scenario.input)).toBe(scenario.result);

      // O documento inteiro como a tela enviou, sem o id; a conta sem tag fica sem o campo `tagId`.
      const [{ id, tagId, ...bill }] = scenario.input;
      expect(await readWithoutRules(`recurringBills/${id}`)).toEqual({ ...bill, ...(tagId && { tagId }) });
    },
  );

  it.each(scenarioEntries(updateRecurringBillRejectedScenarios))(
    'Should refuse the bill of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      await expect(updateRecurringBillService(...scenario.input)).rejects.toMatchObject(scenario.result);

      // Nada é criado.
      const [{ id }] = scenario.input;
      expect(await readWithoutRules(`recurringBills/${id}`)).toBeNull();
    },
  );
});
