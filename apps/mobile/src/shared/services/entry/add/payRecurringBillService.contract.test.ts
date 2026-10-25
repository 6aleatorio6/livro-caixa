import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readStorageWithoutRules } from '@/shared/testing/contract/readStorageWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';

import { payRecurringBillService } from './payRecurringBillService';
import { payRecurringBillRejectedScenarios, payRecurringBillScenarios } from './payRecurringBillService.scenarios';

describe('payRecurringBillService', () => {
  it.each(scenarioEntries<[IRecurringPaymentInput], void>(payRecurringBillScenarios))(
    'Should write the payment of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ bill, month, amountCents }] = scenario.input;

      expect(await payRecurringBillService(...scenario.input)).toBe(scenario.result);

      const uid = testAccountUid(scenario.signedInAs as string);
      const [file0] = await readCollectionWithoutRules('files');
      expect(file0).toEqual({
        id: expect.any(String),
        name: 'comprovante.png',
        storagePath: `files/${file0.id}`,
        type: 'image',
        contentType: 'image/png',
        sizeBytes: RECEIPT_FIXTURE.sizeBytes,
        uploadedBy: uid,
      });
      // Um lançamento só, com o id `{mês}_{conta}`; o nome, a tag (sem tag, sem o campo), o dia do vencimento e o previsto vêm da conta e o valor é o confirmado.
      expect(await readCollectionWithoutRules('entries')).toEqual([
        {
          id: `${month}_${bill.id}`,
          kind: 'recurringPayment',
          month,
          recurringBillId: bill.id,
          name: bill.name,
          ...(bill.tagId && { tagId: bill.tagId }),
          amountCents,
          dueDay: bill.dayOfMonth,
          expectedAmountCents: bill.expectedAmountCents,
          paidBy: uid,
          createdAt: expect.any(Timestamp),
          receiptFileId: file0.id,
        },
      ]);
      expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: true });
      expect(await readStorageWithoutRules(`files/${file0.id}`)).toEqual({
        contentType: 'image/png',
        size: RECEIPT_FIXTURE.sizeBytes,
        customMetadata: { uploadedBy: uid },
      });
    },
  );

  it.each(
    scenarioEntries<[IRecurringPaymentInput], { code: string; userMessage: string }>(payRecurringBillRejectedScenarios),
  )('Should refuse the payment of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = payRecurringBillService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada novo: nenhum arquivo (nem registro, nem objeto no Storage), só os lançamentos que já estavam, e o `hasEntries` segue como estava.
    const alreadyThere = Object.keys(scenario.given)
      .filter((path) => path.startsWith('entries/'))
      .map((path) => path.slice('entries/'.length));
    expect(await readCollectionWithoutRules('files')).toEqual([]);
    expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(alreadyThere);
    expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: false });
  });
});
