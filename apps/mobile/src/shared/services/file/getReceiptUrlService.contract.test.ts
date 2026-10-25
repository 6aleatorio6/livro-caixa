import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { getReceiptUrlService } from './getReceiptUrlService';
import {
  getReceiptUrlFailedScenarios,
  getReceiptUrlRejectedScenarios,
  getReceiptUrlScenarios,
} from './getReceiptUrlService.scenarios';

describe('getReceiptUrlService', () => {
  it.each(scenarioEntries<[string], string>(getReceiptUrlScenarios))(
    'Should deliver an address that opens the file of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [storagePath] = scenario.input;

      const url = await getReceiptUrlService(...scenario.input);

      // Abrir o endereço devolve o objeto pedido, com o tipo que ele foi gravado.
      expect(url).toContain(encodeURIComponent(storagePath));
      const response = await fetch(url);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe(scenario.storageGiven?.[storagePath].contentType);
    },
  );

  it.each(scenarioEntries<[string], { code: string; userMessage: string }>(getReceiptUrlRejectedScenarios))(
    'Should refuse the address of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const refusal = getReceiptUrlService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
    },
  );

  it.each(scenarioEntries<[string], { code: string }>(getReceiptUrlFailedScenarios))(
    'Should let the Firebase error through for the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const failure = getReceiptUrlService(...scenario.input);

      await expect(failure).rejects.toMatchObject(scenario.result);
      await expect(failure).rejects.not.toBeInstanceOf(AppError);
    },
  );
});
