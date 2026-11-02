import { Timestamp } from 'firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { listenTo } from '@/shared/testing/contract/listenTo';
import { readCollectionWithoutRules } from '@/shared/testing/contract/readCollectionWithoutRules';
import { readContentWithoutRules } from '@/shared/testing/contract/readContentWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';

import { deleteEntryService } from './deleteEntryService';
import { deleteEntryRejectedScenarios, deleteEntryScenarios } from './deleteEntryService.scenarios';

describe('deleteEntryService', () => {
  it.each(scenarioEntries<Parameters<typeof deleteEntryService>, void>(deleteEntryScenarios))(
    'Should delete the entry of the scenario %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      const [entry] = scenario.input;

      expect(await deleteEntryService(...scenario.input)).toBe(scenario.result);

      // Somem o lançamento, o registro e o conteúdo do comprovante, e o mês deixa de trazer o lançamento; na última
      // contribuição de um pagamento sem dono, o pagamento sai junto.
      const remainingEntryIds = (scenario as { remainingEntryIds?: string[] }).remainingEntryIds ?? [];
      expect((await readCollectionWithoutRules('entries')).map(({ id }) => id)).toEqual(remainingEntryIds);
      expect(await readCollectionWithoutRules('files')).toEqual([]);
      expect(await readContentWithoutRules(entry.receiptFileId)).toBeNull();
      const month = await listenTo(entryMonthQueryService, { month: entry.month }).next();
      expect(month.map(({ id }) => id).sort()).toEqual([...remainingEntryIds].sort());
    },
  );

  it.each(
    scenarioEntries<Parameters<typeof deleteEntryService>, { code: string; userMessage: string }>(
      deleteEntryRejectedScenarios,
    ),
  )('Should refuse the deletion of the scenario %s', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const refusal = deleteEntryService(...scenario.input);

      await expect(refusal).rejects.toBeInstanceOf(AppError);
      await expect(refusal).rejects.toMatchObject(scenario.result);
      // Nada muda: o lote é recusado inteiro, e fica só o que o cenário já tinha.
      const entryPaths = Object.keys(scenario.given).filter((path) => path.startsWith('entries/'));
      const filePaths = Object.keys(scenario.given).filter((path) => path.startsWith('files/'));
      expect(await readCollectionWithoutRules('entries')).toEqual(
        entryPaths.map((path) => ({
          id: path.slice('entries/'.length),
          ...scenario.given[path],
          createdAt: expect.any(Timestamp),
        })),
      );
      expect(await readCollectionWithoutRules('files')).toHaveLength(filePaths.length);
      expect((await readCollectionWithoutRules('fileContents')).map(({ id }) => id)).toEqual(
        scenario.fileContentsGiven ?? [],
      );
    },
  );
});
