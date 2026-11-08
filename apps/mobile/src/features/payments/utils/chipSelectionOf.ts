import type { IChipSelection } from '../types/ChipSelection';
import type { IMemberChoice } from '../types/MemberChoice';
import type { IPeopleFilter } from '../types/PeopleFilter';

/**
 * Quem está marcado nos chips. Em "Todos", todas as pessoas da lista, inclusive quem acabou de entrar. Nos outros
 * modos, os uids que a pessoa tocou: quem saiu da lista sai da seleção, e sem ninguém marcado (nada tocado ainda, ou
 * só quem saiu estava marcado) vale o chip "Você".
 */
export function chipSelectionOf(
  { mode, markedUids }: IPeopleFilter,
  choices: IMemberChoice[],
  uid: string,
): IChipSelection {
  if (mode === 'everyone') {
    return { kind: 'everyone', markedUids: new Set(choices.map((choice) => choice.uid)), rowUids: null };
  }

  const marked = choices.filter((choice) => markedUids.has(choice.uid));
  const selected = marked.length > 0 ? marked : choices.filter((choice) => choice.uid === uid);
  const selectedUids = new Set(selected.map((member) => member.uid));
  const names = selected.map((member) => member.name);

  if (selected.length === 1) {
    const selection = { markedUids: selectedUids, rowUids: selectedUids };
    return selected[0].uid === uid ? { kind: 'me', ...selection } : { kind: 'other', name: names[0], ...selection };
  }

  return { kind: 'several', names, markedUids: selectedUids, rowUids: selectedUids };
}
