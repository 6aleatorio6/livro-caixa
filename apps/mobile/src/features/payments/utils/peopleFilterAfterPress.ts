import type { IMemberChoice } from '../types/MemberChoice';
import type { IPeopleFilter } from '../types/PeopleFilter';

/**
 * O filtro depois de tocar num chip. Em "Uma pessoa", o chip troca a pessoa. Em "Várias" e em "Todos", ele alterna a
 * marca dela, menos a da última marcada, que fica: a lista nunca fica sem ninguém. Desmarcar alguém em "Todos" passa
 * para "Várias", e marcar a última pessoa em "Várias" passa para "Todos" (havendo mais de uma pessoa).
 */
export function peopleFilterAfterPress(
  { mode, markedUids }: IPeopleFilter,
  pressed: IMemberChoice,
  choices: IMemberChoice[],
): IPeopleFilter {
  if (mode === 'one') return { mode: 'one', markedUids: new Set([pressed.uid]) };

  const nextMarkedUids = toggledUids(markedUids, pressed.uid);
  const isEveryoneMarked = choices.length > 1 && choices.every((choice) => nextMarkedUids.has(choice.uid));
  return { mode: isEveryoneMarked ? 'everyone' : 'several', markedUids: nextMarkedUids };
}

function toggledUids(markedUids: ReadonlySet<string>, uid: string): ReadonlySet<string> {
  if (!markedUids.has(uid)) return new Set([...markedUids, uid]);
  if (markedUids.size === 1) return markedUids;

  return new Set([...markedUids].filter((markedUid) => markedUid !== uid));
}
