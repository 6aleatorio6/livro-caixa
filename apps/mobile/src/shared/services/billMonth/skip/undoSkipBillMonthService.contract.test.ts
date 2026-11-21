import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { givenIdsOf } from '@/shared/testing/contract/givenIdsOf';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { undoSkipBillMonthService } from './undoSkipBillMonthService';
import { undoSkipBillMonthRejectedScenarios, undoSkipBillMonthScenarios } from './undoSkipBillMonthService.scenarios';

type IUndoSkipBillMonthArguments = Parameters<typeof undoSkipBillMonthService>;

describe('undoSkipBillMonthService', () => {
  it.each(scenarioEntries<IUndoSkipBillMonthArguments, void>(undoSkipBillMonthScenarios))(
    'Should delete the skipped month of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ bill, month }] = scenario.input;
      const id = `${month}_${bill.id}`;

      expect(await undoSkipBillMonthService(...scenario.input)).toBe(scenario.result);

      // O documento some, e os outros meses de conta ficam.
      const otherIds = givenIdsOf(scenario.given, 'billMonths').filter((givenId) => givenId !== id);
      expect((await readCollectionWithoutRules('billMonths')).map(({ id: remainingId }) => remainingId)).toEqual(
        otherIds,
      );
    },
  );

  it.each(
    scenarioEntries<IUndoSkipBillMonthArguments, { code: string; userMessage: string }>(
      undoSkipBillMonthRejectedScenarios,
    ),
  )('Should refuse to undo the skip of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = undoSkipBillMonthService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada muda: os meses de conta que já estavam ficam.
    expect((await readCollectionWithoutRules('billMonths')).map(({ id }) => id)).toEqual(
      givenIdsOf(scenario.given, 'billMonths'),
    );
  });
});
