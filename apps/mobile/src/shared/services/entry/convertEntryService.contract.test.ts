import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readContentWithoutRules } from '@/shared/testing/contract/readContentWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';

import { convertEntryService } from './convertEntryService';
import { convertEntryRejectedScenarios, convertEntryScenarios } from './convertEntryService.scenarios';

/** Os lançamentos como a coleção os devolve, sem o `createdAt` (o servidor carimba a hora da troca). */
async function entriesWithoutCreatedAt() {
  return (await readCollectionWithoutRules('entries')).map(({ createdAt: _createdAt, ...entry }) => entry);
}

describe('convertEntryService', () => {
  it.each(Object.entries(convertEntryScenarios))(
    'Should convert the entry of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [input] = scenario.input;

      expect(await convertEntryService(input)).toBe(scenario.result);

      // Os campos `undefined` do esperado são os que o documento perdeu: o `toEqual` os trata como ausentes.
      const entries = await entriesWithoutCreatedAt();
      expect(entries).toHaveLength(scenario.expectedEntries.length);
      expect(entries).toEqual(expect.arrayContaining(scenario.expectedEntries));
      const files = await readCollectionWithoutRules('files');
      expect(files).toHaveLength(1);
      if (scenario.wasReceiptReplaced) {
        // O comprovante antigo sai com o conteúdo; o novo fica, com os bytes lidos.
        expect(files[0].id).not.toBe(input.entry.receiptFileId);
        expect(await readContentWithoutRules(input.entry.receiptFileId)).toBeNull();
        expect(await readContentWithoutRules(files[0].id)).toEqual(RECEIPT_FIXTURE.bytes);
      } else {
        expect(files[0].id).toBe(input.entry.receiptFileId);
        expect(await readContentWithoutRules(files[0].id)).toEqual(RECEIPT_FIXTURE.bytes);
      }
    },
  );

  it.each(scenarioEntries<[IConvertEntryInput], { code: string; userMessage: string }>(convertEntryRejectedScenarios))(
    'Should refuse the conversion of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const before = await entriesWithoutCreatedAt();

      const refusal = convertEntryService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      expect(await entriesWithoutCreatedAt()).toEqual(before);
    },
  );
});
