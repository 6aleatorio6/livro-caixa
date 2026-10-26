import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { getReceiptContentService } from './getReceiptContentService';
import {
  getReceiptContentFailedScenarios,
  getReceiptContentRejectedScenarios,
  getReceiptContentScenarios,
} from './getReceiptContentService.scenarios';

describe('getReceiptContentService', () => {
  it.each(scenarioEntries<[string, string], string>(getReceiptContentScenarios))(
    'Should deliver the receipt of the scenario %s as a data uri',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await getReceiptContentService(...scenario.input)).toBe(scenario.result);
    },
  );

  it.each(scenarioEntries<[string, string], { code: string; userMessage: string }>(getReceiptContentRejectedScenarios))(
    'Should refuse the receipt of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const refusal = getReceiptContentService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
    },
  );

  it.each(scenarioEntries<[string, string], { code: string }>(getReceiptContentFailedScenarios))(
    'Should let the Firebase error through for the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const failure = getReceiptContentService(...scenario.input);

      await expect(failure).rejects.toMatchObject(scenario.result);
      await expect(failure).rejects.not.toBeInstanceOf(AppError);
    },
  );
});
