import type { IPeopleMode } from './PeopleMode';

/** O filtro das pessoas de Pagamentos: o modo escolhido e os uids que a pessoa marcou nos chips. */
export interface IPeopleFilter {
  mode: IPeopleMode;
  markedUids: ReadonlySet<string>;
}
