import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readStorageWithoutRules } from '@/shared/testing/contract/readStorageWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';

import { addOneOffBillService } from './addOneOffBillService';
import { addOneOffBillRejectedScenarios, addOneOffBillScenarios } from './addOneOffBillService.scenarios';

describe('addOneOffBillService', () => {
  it.each(scenarioEntries<[IOneOffBillInput], void>(addOneOffBillScenarios))(
    'Should write the one-off bill of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ tagId, ...bill }] = scenario.input;

      expect(await addOneOffBillService(...scenario.input)).toBe(scenario.result);

      const uid = testAccountUid(scenario.signedInAs as string);
      const [file0] = await readCollectionWithoutRules('files');
      expect(file0).toEqual({
        id: expect.any(String),
        storagePath: `files/${file0.id}`,
        type: 'image',
        contentType: 'image/png',
        sizeBytes: RECEIPT_FIXTURE.sizeBytes,
        uploadedBy: uid,
      });
      // Um lançamento só; sem tag, sem o campo `tagId`; o mês é o da data.
      expect(await readCollectionWithoutRules('entries')).toEqual([
        {
          id: expect.any(String),
          kind: 'oneOffBill',
          month: bill.date.slice(0, 7),
          name: bill.name,
          amountCents: bill.amountCents,
          date: bill.date,
          ...(tagId && { tagId }),
          paidBy: uid,
          createdAt: expect.any(Timestamp),
          receiptFileId: file0.id,
        },
      ]);
      expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: true });
      expect(await readStorageWithoutRules(`files/${file0.id}`)).toEqual({
        contentType: 'image/png',
        size: RECEIPT_FIXTURE.sizeBytes,
      });
    },
  );

  it.each(scenarioEntries<[IOneOffBillInput], { code: string; userMessage: string }>(addOneOffBillRejectedScenarios))(
    'Should refuse the one-off bill of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      const refusal = addOneOffBillService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada é gravado: nem o arquivo, nem o lançamento, e o `hasEntries` segue como estava.
      expect(await readCollectionWithoutRules('files')).toEqual([]);
      expect(await readCollectionWithoutRules('entries')).toEqual([]);
      expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: false });
    },
  );
});
