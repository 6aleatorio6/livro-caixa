import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { givenIdsOf } from '@/shared/testing/contract/givenIdsOf';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readContentWithoutRules } from '@/shared/testing/contract/readContentWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IOverduePaymentInput } from '@/shared/types/entry/OverduePaymentInput';
import { currentMonth } from '@/shared/utils/date/currentMonth';

import { payOverdueBillService } from './payOverdueBillService';
import { payOverdueBillRejectedScenarios, payOverdueBillScenarios } from './payOverdueBillService.scenarios';

describe('payOverdueBillService', () => {
  it.each(scenarioEntries<[IOverduePaymentInput], void>(payOverdueBillScenarios))(
    'Should write the overdue payment of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [{ bill, billMonth, amountCents }] = scenario.input;

      expect(await payOverdueBillService(...scenario.input)).toBe(scenario.result);

      const uid = testAccountUid(scenario.signedInAs as string);
      const [file] = await readCollectionWithoutRules('files');
      expect(file).toEqual({
        id: expect.any(String),
        name: 'comprovante.png',
        type: 'image',
        contentType: 'image/png',
        sizeBytes: RECEIPT_FIXTURE.sizeBytes,
        uploadedBy: uid,
      });
      // O pagamento tem id gerado e conta no mês de hoje; o nome, a tag, o dia do vencimento e o previsto vêm da conta, e
      // o `billMonth` diz de que mês ela é.
      const entries = await readCollectionWithoutRules('entries');
      expect(entries).toEqual([
        {
          id: expect.any(String),
          kind: 'overduePayment',
          month: currentMonth(),
          billMonth,
          recurringBillId: bill.id,
          name: bill.name,
          ...(bill.tagId && { tagId: bill.tagId }),
          dueDay: bill.dayOfMonth,
          expectedAmountCents: bill.expectedAmountCents,
          amountCents,
          paidBy: uid,
          createdAt: expect.any(Timestamp),
          receiptFileId: file.id,
        },
      ]);
      // O mês da conta fica pago depois, apontando para o pagamento, seja de um mês sem documento, seja de um pulado.
      expect(await readCollectionWithoutRules('overdueMonths')).toEqual([
        {
          id: `${billMonth}_${bill.id}`,
          status: 'paidLater',
          month: billMonth,
          recurringBillId: bill.id,
          entryId: entries[0].id,
          name: bill.name,
          ...(bill.tagId && { tagId: bill.tagId }),
          createdBy: uid,
          createdAt: expect.any(Timestamp),
        },
      ]);
      expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: true });
      expect(await readContentWithoutRules(file.id)).toEqual(RECEIPT_FIXTURE.bytes);
    },
  );

  it.each(
    scenarioEntries<[IOverduePaymentInput], { code: string; userMessage: string }>(payOverdueBillRejectedScenarios),
  )('Should refuse the overdue payment of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = payOverdueBillService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada novo: nenhum arquivo, só os lançamentos e o mês de conta que já estavam, e o `hasEntries` segue como estava.
    expect(await readCollectionWithoutRules('files')).toEqual([]);
    expect(await readCollectionWithoutRules('fileContents')).toEqual([]);
    expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(
      givenIdsOf(scenario.given, 'entries'),
    );
    expect((await readCollectionWithoutRules('overdueMonths')).map(({ id }) => id)).toEqual(
      givenIdsOf(scenario.given, 'overdueMonths'),
    );
    expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: false });
  });
});
