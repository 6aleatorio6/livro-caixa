import { router, useLocalSearchParams } from 'expo-router';

import { EntryProblem } from '@/features/entries/components/EntryProblem/EntryProblem';
import { BottomSheet } from '@/shared/components/BottomSheet/BottomSheet';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';

import { EntryDetailsContent } from './components/EntryDetailsContent/EntryDetailsContent';

/** Os detalhes de um lançamento da família numa folha de baixo: qualquer membro os vê, só o autor altera e exclui. */
export function EntryDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, data: entry } = useRealtime(entryQueryService, { id });

  return (
    <BottomSheet onClose={() => router.back()}>
      {entry ? <EntryDetailsContent entry={entry} /> : null}
      {/* Só o servidor diz que o lançamento não existe mais: a leitura do aparelho pode estar atrasada. */}
      {status === 'success' && !entry ? <EntryProblem reason="deleted" /> : null}
      {status === 'error' ? <EntryProblem reason="unreadable" /> : null}
    </BottomSheet>
  );
}
