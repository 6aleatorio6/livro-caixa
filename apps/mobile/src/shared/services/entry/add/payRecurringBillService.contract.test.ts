import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readContentWithoutRules } from '@/shared/testing/contract/readContentWithoutRules';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import { writeWithoutRules } from '@/shared/testing/contract/writeWithoutRules';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';

import { payRecurringBillService } from './payRecurringBillService';
import { payRecurringBillRejectedScenarios, payRecurringBillScenarios } from './payRecurringBillService.scenarios';

// A leitura do comprovante é a de verdade; o mock só deixa o teste gravar o pagamento de outro membro durante ela.
jest.mock('@/shared/services/entry/addReceiptToBatch', () => {
  const actual = jest.requireActual('@/shared/services/entry/addReceiptToBatch');
  return { addReceiptToBatch: jest.fn(actual.addReceiptToBatch) };
});

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
      expect(await readContentWithoutRules(file0.id)).toEqual(RECEIPT_FIXTURE.bytes);
    },
  );

  it.each(
    scenarioEntries<[IRecurringPaymentInput], { code: string; userMessage: string }>(payRecurringBillRejectedScenarios),
  )('Should refuse the payment of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);

    const refusal = payRecurringBillService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject(scenario.result);
    // Nada novo: nenhum arquivo (nem registro, nem conteúdo), só os lançamentos que já estavam, e o `hasEntries` segue como estava.
    const alreadyThere = Object.keys(scenario.given)
      .filter((path) => path.startsWith('entries/'))
      .map((path) => path.slice('entries/'.length));
    expect(await readCollectionWithoutRules('files')).toEqual([]);
    expect(await readCollectionWithoutRules('fileContents')).toEqual([]);
    expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(alreadyThere);
    expect(await readWithoutRules(`allowedEmails/${scenario.signedInAs}`)).toMatchObject({ hasEntries: false });
  });

  // A corrida: o mês estava livre na leitura, e outro membro o paga enquanto o comprovante é lido. A regra recusa o
  // lote (o SDK do contrato manda `permission-denied`, sem o prefixo do React Native Firebase).
  it('Should say the bill was already paid when another member pays it while the receipt is read', async () => {
    const scenario = payRecurringBillScenarios.memberPaysBill;
    const paidByAna = payRecurringBillRejectedScenarios.billAlreadyPaidByAnother.given['entries/2026-10_internet'];
    await arrangeScenario(scenario);
    const actualRead = jest.mocked(addReceiptToBatch).getMockImplementation()!;
    jest.mocked(addReceiptToBatch).mockImplementationOnce(async (...args) => {
      await writeWithoutRules({ 'entries/2026-10_internet': paidByAna });
      return actualRead(...args);
    });

    const refusal = payRecurringBillService(...scenario.input);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject({ code: 'ALREADY_PAID' });
  });
});
