import type { IChipSelection } from '../types/ChipSelection';
import type { IMemberChoice } from '../types/MemberChoice';
import type { IPeopleFilter } from '../types/PeopleFilter';
import type { IPeopleMode } from '../types/PeopleMode';

/**
 * O filtro ao escolher um modo, a partir de quem está marcado. "Todos" marca todas as pessoas por ser o modo. "Uma
 * pessoa" fica com a primeira marcada na ordem dos chips, que começa em "Você". "Várias" mantém as marcadas, menos
 * vindo de "Todos": aí começa de "Você", para a escolha partir de uma pessoa.
 */
export function peopleFilterForMode(
  mode: IPeopleMode,
  selection: IChipSelection,
  choices: IMemberChoice[],
  uid: string,
): IPeopleFilter {
  if (mode === 'everyone') return { mode, markedUids: selection.markedUids };
  if (mode === 'several') {
    return { mode, markedUids: selection.kind === 'everyone' ? new Set([uid]) : selection.markedUids };
  }

  const firstMarked = choices.find((choice) => selection.markedUids.has(choice.uid));
  return { mode, markedUids: new Set([firstMarked?.uid ?? uid]) };
}
