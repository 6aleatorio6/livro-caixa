import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { givenIdsOf } from '@/shared/testing/contract/givenIdsOf';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { undoSkipOverdueMonthService } from './undoSkipOverdueMonthService';
import {
  undoSkipOverdueMonthRejectedScenarios,
  undoSkipOverdueMonthScenarios,
} from './undoSkipOverdueMonthService.scenarios';

type IUndoSkipOverdueMonthArguments = Parameters<typeof undoSkipOverdueMonthService>;

describe('undoSkipOverdueMonthService', () => {
  it.each(scenarioEntries<IUndoSkipOverdueMonthArguments, void>(undoSkipOverdueMonthScenarios))(
    'Should delete the skipped month of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ bill, month }] = scenario.input;
      const id = `${month}_${bill.id}`;

      expect(await undoSkipOverdueMonthService(...scenario.input)).toBe(scenario.result);

      // O documento some, e os outros meses de conta ficam.
      const otherIds = givenIdsOf(scenario.given, 'overdueMonths').filter((givenId) => givenId !== id);
      expect((await readCollectionWithoutRules('overdueMonths')).map(({ id: remainingId }) => remainingId)).toEqual(
        otherIds,
      );
    },
  );

  it.each(
    scenarioEntries<IUndoSkipOverdueMonthArguments, { code: string; userMessage: string }>(
      undoSkipOverdueMonthRejectedScenarios,
    ),
  )('Should refuse to undo the skip of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = undoSkipOverdueMonthService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada muda: os meses de conta que já estavam ficam.
    expect((await readCollectionWithoutRules('overdueMonths')).map(({ id }) => id)).toEqual(
      givenIdsOf(scenario.given, 'overdueMonths'),
    );
  });
});
