import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readContentWithoutRules } from '@/shared/testing/contract/readContentWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IContributionInput } from '@/shared/types/entry/ContributionInput';

import { addContributionService } from './addContributionService';
import { addContributionRejectedScenarios, addContributionScenarios } from './addContributionService.scenarios';

/** Os lançamentos que o cenário gravou antes, por id. */
const entriesGiven = (given: Record<string, object>) =>
  Object.fromEntries(
    Object.entries(given).flatMap(([path, document]) =>
      path.startsWith('entries/') ? [[path.slice('entries/'.length), document]] : [],
    ),
  );

describe('addContributionService', () => {
  it.each(scenarioEntries<[IContributionInput], void>(addContributionScenarios))(
    'Should write the contribution of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ target, amountCents }] = scenario.input;
      const targetId = 'entry' in target ? target.entry.id : `${target.month}_${target.bill.id}`;
      const month = 'entry' in target ? target.entry.month : target.month;
      const given = entriesGiven(scenario.given);

      expect(await addContributionService(...scenario.input)).toBe(scenario.result);

      const uid = testAccountUid(scenario.signedInAs as string);
      const [file] = (await readCollectionWithoutRules('files')).filter(({ uploadedBy }) => uploadedBy === uid);
      expect(file).toMatchObject({ name: 'comprovante-novo.png', sizeBytes: RECEIPT_FIXTURE.sizeBytes });
      expect(await readContentWithoutRules(file.id)).toEqual(RECEIPT_FIXTURE.bytes);
      expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: true });

      const entries = await readCollectionWithoutRules('entries');
      const added = entries.filter(({ id }) => !(id in given));
      // A contribuição, com o id gerado, aponta para o lançamento; o pagamento sem dono só nasce se o mês não o tinha.
      const contribution = added.find(({ kind }) => kind === 'contribution');
      expect(contribution).toEqual({
        id: expect.any(String),
        kind: 'contribution',
        month,
        entryId: targetId,
        amountCents,
        paidBy: uid,
        createdAt: expect.any(Timestamp),
        receiptFileId: file.id,
      });
      if ('bill' in target && !(targetId in given)) {
        const { bill } = target;
        expect(added.find(({ id }) => id === targetId)).toEqual({
          id: targetId,
          kind: 'recurringPayment',
          month,
          recurringBillId: bill.id,
          name: bill.name,
          ...(bill.tagId && { tagId: bill.tagId }),
          dueDay: bill.dayOfMonth,
          expectedAmountCents: bill.expectedAmountCents,
          createdAt: expect.any(Timestamp),
        });
        expect(added).toHaveLength(2);
      } else {
        expect(added).toHaveLength(1);
        expect(entries.find(({ id }) => id === targetId)).toMatchObject({
          ...given[targetId],
          createdAt: expect.any(Timestamp),
        });
      }
    },
  );

  it.each(
    scenarioEntries<[IContributionInput], { code: string; userMessage: string }>(addContributionRejectedScenarios),
  )('Should refuse the contribution of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = addContributionService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada novo: nem arquivo, nem lançamento.
    expect(await readCollectionWithoutRules('files')).toEqual([]);
    expect(await readCollectionWithoutRules('fileContents')).toEqual([]);
    expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(
      Object.keys(entriesGiven(scenario.given)),
    );
  });
});
