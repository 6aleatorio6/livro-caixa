import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';

import { receiptFileQueryService } from './receiptFileQueryService';
import { receiptFileQueryScenarios } from './receiptFileQueryService.scenarios';

describe('receiptFileQueryService', () => {
  it.each(scenarioEntries<{ id: string | null }, IReceiptFile | null>(receiptFileQueryScenarios))(
    'Should deliver what the scenario %s says',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const reading = listenTo(receiptFileQueryService, scenario.input);

      expect(await reading.next()).toEqual(scenario.result);
    },
  );
});
