import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readStorageWithoutRules } from '@/shared/testing/contract/readStorageWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';

import { updateEntryService } from './updateEntryService';
import { updateEntryRejectedScenarios, updateEntryScenarios } from './updateEntryService.scenarios';

/** Os documentos de `files` que o cenário gravou antes, como a coleção os devolve. */
function filesGiven(given: Record<string, object>) {
  return Object.entries(given)
    .filter(([path]) => path.startsWith('files/'))
    .map(([path, document]) => ({ id: path.slice('files/'.length), ...document }));
}

describe('updateEntryService', () => {
  it.each(Object.entries(updateEntryScenarios))('Should change the entry of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const [input] = scenario.input;
    const { entry } = input;
    const [oldFile] = filesGiven(scenario.given);

    expect(await updateEntryService(input)).toBe(scenario.result);

    const [entryAfter] = await readCollectionWithoutRules('entries');
    expect(entryAfter).toEqual({
      id: entry.id,
      ...scenario.expectedEntry,
      createdAt: expect.any(Timestamp),
      ...(scenario.wasReceiptReplaced && { receiptFileId: expect.any(String) }),
    });
    if (!scenario.wasReceiptReplaced) {
      expect(await readCollectionWithoutRules('files')).toEqual([oldFile]);
      expect(await readStorageWithoutRules(`files/${oldFile.id}`)).toMatchObject({ contentType: 'image/png' });
      return;
    }
    // Trocado: sobra só o registro novo (com o nome e o autor), e o objeto novo existe com o autor nos metadados; o antigo some dos dois lados.
    expect(entryAfter.receiptFileId).not.toBe(entry.receiptFileId);
    expect(await readCollectionWithoutRules('files')).toEqual([
      {
        id: entryAfter.receiptFileId,
        name: 'comprovante-novo.png',
        storagePath: `files/${entryAfter.receiptFileId}`,
        type: 'image',
        contentType: 'image/png',
        sizeBytes: RECEIPT_FIXTURE.sizeBytes,
        uploadedBy: testAccountUid(scenario.signedInAs),
      },
    ]);
    expect(await readStorageWithoutRules(`files/${entryAfter.receiptFileId}`)).toEqual({
      contentType: 'image/png',
      size: RECEIPT_FIXTURE.sizeBytes,
      customMetadata: { uploadedBy: testAccountUid(scenario.signedInAs) },
    });
    await expect(readStorageWithoutRules(`files/${entry.receiptFileId}`)).rejects.toBeDefined();
  });

  it.each(scenarioEntries<[IUpdateEntryInput], { code: string; userMessage: string }>(updateEntryRejectedScenarios))(
    'Should refuse the change of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const refusal = updateEntryService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada muda: os lançamentos, os registros dos comprovantes e os objetos ficam como o cenário os deixou, e nenhum arquivo novo sobra.
      const entryPaths = Object.keys(scenario.given).filter((path) => path.startsWith('entries/'));
      expect(await readCollectionWithoutRules('entries')).toEqual(
        entryPaths.map((path) => ({ id: path.slice('entries/'.length), ...scenario.given[path], createdAt: expect.any(Timestamp) })),
      );
      expect(await readCollectionWithoutRules('files')).toEqual(filesGiven(scenario.given));
      for (const path of Object.keys(scenario.storageGiven ?? {})) {
        expect(await readStorageWithoutRules(path)).toMatchObject({ contentType: 'image/png' });
      }
    },
  );
});
