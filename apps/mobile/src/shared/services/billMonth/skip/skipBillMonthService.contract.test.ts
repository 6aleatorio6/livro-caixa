import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { givenIdsOf } from '@/shared/testing/contract/givenIdsOf';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';

import { skipBillMonthService } from './skipBillMonthService';
import { skipBillMonthRejectedScenarios, skipBillMonthScenarios } from './skipBillMonthService.scenarios';

type ISkipBillMonthArguments = Parameters<typeof skipBillMonthService>;

describe('skipBillMonthService', () => {
  it.each(scenarioEntries<ISkipBillMonthArguments, void>(skipBillMonthScenarios))(
    'Should write the skipped month of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ bill, month }] = scenario.input;

      expect(await skipBillMonthService(...scenario.input)).toBe(scenario.result);

      // O mês pulado tem o id `{mês}_{conta}`, sem `entryId`, com o nome e a tag da conta (sem tag, sem o campo) e quem pulou.
      expect(await readCollectionWithoutRules('billMonths')).toEqual([
        {
          id: `${month}_${bill.id}`,
          status: 'skipped',
          month,
          recurringBillId: bill.id,
          name: bill.name,
          ...(bill.tagId && { tagId: bill.tagId }),
          createdBy: testAccountUid(scenario.signedInAs as string),
          createdAt: expect.any(Timestamp),
        },
      ]);
    },
  );

  it.each(
    scenarioEntries<ISkipBillMonthArguments, { code: string; userMessage: string }>(skipBillMonthRejectedScenarios),
  )('Should refuse to skip the month of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = skipBillMonthService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada novo: nenhum mês de conta, e os lançamentos que já estavam ficam.
    expect(await readCollectionWithoutRules('billMonths')).toEqual([]);
    expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(
      givenIdsOf(scenario.given, 'entries'),
    );
  });
});
