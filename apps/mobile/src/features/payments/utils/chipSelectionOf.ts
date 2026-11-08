import type { IChipSelection } from '../types/ChipSelection';
import type { IMemberChoice } from '../types/MemberChoice';

/**
 * Quem está marcado nos chips, dos uids que a pessoa tocou: quem saiu da lista sai da seleção, e sem ninguém marcado
 * (nada tocado ainda, ou só quem saiu estava marcado) vale o chip "Você". "Todos" é derivado: fica marcado quando todas as
 * pessoas estão, e só havendo mais de uma, para não aparecer marcado enquanto a lista de pessoas carrega.
 */
export function chipSelectionOf(
  markedUids: ReadonlySet<string>,
  choices: IMemberChoice[],
  uid: string,
): IChipSelection {
  const members = choices.filter((choice) => choice.kind === 'member');
  const marked = members.filter((member) => markedUids.has(member.uid));
  const selected = marked.length > 0 ? marked : members.filter((member) => member.uid === uid);
  const selectedUids = new Set(selected.map((member) => member.uid));
  const names = selected.map((member) => member.name);

  if (members.length > 1 && selected.length === members.length) {
    return { kind: 'everyone', markedUids: selectedUids, rowUids: null };
  }
  if (selected.length === 1) {
    const selection = { markedUids: selectedUids, rowUids: selectedUids };
    return selected[0].uid === uid ? { kind: 'me', ...selection } : { kind: 'other', name: names[0], ...selection };
  }

  return { kind: 'several', names, markedUids: selectedUids, rowUids: selectedUids };
}
