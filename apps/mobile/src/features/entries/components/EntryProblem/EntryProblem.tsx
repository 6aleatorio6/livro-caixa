import { AppText } from '@/shared/components/AppText/AppText';

export interface IEntryProblemProps {
  /** O que houve com a leitura: o lançamento não existe mais (`deleted`) ou não deu para lê-lo (`unreadable`). */
  reason: 'deleted' | 'unreadable';
}

const MESSAGES = {
  deleted: 'Este lançamento foi excluído.',
  unreadable: 'Não deu para carregar o lançamento.',
};

/** O que as telas do lançamento dizem quando não há o que mostrar. */
export function EntryProblem({ reason }: IEntryProblemProps) {
  return (
    <AppText variant="bodyMedium" color="onSurfaceVariant">
      {MESSAGES[reason]}
    </AppText>
  );
}
