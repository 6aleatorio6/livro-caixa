import type { IMemberChoice } from '../types/MemberChoice';

/**
 * Os uids marcados depois de tocar num chip: "Todos" marca todas as pessoas (com todas marcadas, nada muda), e o chip
 * de uma pessoa alterna a marca dela, menos a última marcada, que fica: a lista nunca fica sem ninguém.
 */
export function markedUidsAfterPress(
  markedUids: ReadonlySet<string>,
  pressed: IMemberChoice,
  choices: IMemberChoice[],
): ReadonlySet<string> {
  if (pressed.kind === 'everyone') {
    return new Set(choices.flatMap((choice) => (choice.kind === 'member' ? [choice.uid] : [])));
  }
  if (!markedUids.has(pressed.uid)) return new Set([...markedUids, pressed.uid]);
  if (markedUids.size === 1) return markedUids;

  return new Set([...markedUids].filter((markedUid) => markedUid !== pressed.uid));
}
