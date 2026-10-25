import { pluralize } from './pluralize';

/** A contagem de pessoas por extenso: "1 pessoa", "3 pessoas". */
export function peopleCount(count: number) {
  return pluralize(count, 'pessoa', 'pessoas');
}
