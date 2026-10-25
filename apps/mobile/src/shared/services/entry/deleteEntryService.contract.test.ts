import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readStorageWithoutRules } from '@/shared/testing/contract/readStorageWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import type { IEntry } from '@/shared/types/entry/Entry';

import { deleteEntryService } from './deleteEntryService';
import { deleteEntryRejectedScenarios, deleteEntryScenarios } from './deleteEntryService.scenarios';

describe('deleteEntryService', () => {
  it.each(scenarioEntries<[IEntry], void>(deleteEntryScenarios))(
    'Should delete the entry of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [entry] = scenario.input;

      expect(await deleteEntryService(...scenario.input)).toBe(scenario.result);

      // Somem o lançamento, o registro do comprovante e o objeto, e o mês deixa de trazer o lançamento.
      expect(await readCollectionWithoutRules('entries')).toEqual([]);
      expect(await readCollectionWithoutRules('files')).toEqual([]);
      await expect(readStorageWithoutRules(`files/${entry.receiptFileId}`)).rejects.toBeDefined();
      expect(await listenTo(entryMonthQueryService, { month: entry.month }).next()).toEqual([]);
    },
  );

  it.each(scenarioEntries<[IEntry], { code: string; userMessage: string }>(deleteEntryRejectedScenarios))(
    'Should refuse the deletion of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const refusal = deleteEntryService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada muda: o lote é recusado inteiro, e fica só o que o cenário já tinha.
      const entryPaths = Object.keys(scenario.given).filter((path) => path.startsWith('entries/'));
      const filePaths = Object.keys(scenario.given).filter((path) => path.startsWith('files/'));
      expect(await readCollectionWithoutRules('entries')).toEqual(
        entryPaths.map((path) => ({ id: path.slice('entries/'.length), ...scenario.given[path], createdAt: expect.any(Timestamp) })),
      );
      expect(await readCollectionWithoutRules('files')).toHaveLength(filePaths.length);
      for (const path of Object.keys(scenario.storageGiven ?? {})) {
        expect(await readStorageWithoutRules(path)).toMatchObject({ contentType: 'image/png' });
      }
    },
  );
});
