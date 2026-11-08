import { personOf } from '@/shared/testing/personOf';

import { markedUidsAfterPress } from './markedUidsAfterPress';
import { memberChoicesOf } from './memberChoicesOf';

// Quem está logado é o Bruno: o chip dele é o "Você", logo depois do "Todos".
const people = [personOf('bruno', 'Bruno'), personOf('ana', 'Ana'), personOf('clara', 'Clara')];
const choices = memberChoicesOf(people, 'bruno');
const [everyone, you, ana] = choices;

describe('markedUidsAfterPress', () => {
  it('Should mark every person when "Todos" is pressed', () => {
    expect(markedUidsAfterPress(new Set(['bruno']), everyone, choices)).toEqual(new Set(['bruno', 'ana', 'clara']));
  });

  it('Should change nothing when "Todos" is pressed with everybody already marked', () => {
    expect(markedUidsAfterPress(new Set(['bruno', 'ana', 'clara']), everyone, choices)).toEqual(
      new Set(['bruno', 'ana', 'clara']),
    );
  });

  it('Should add a person who is not marked, keeping the others', () => {
    expect(markedUidsAfterPress(new Set(['bruno']), ana, choices)).toEqual(new Set(['bruno', 'ana']));
  });

  it('Should unmark a marked person while others remain marked', () => {
    expect(markedUidsAfterPress(new Set(['bruno', 'ana']), ana, choices)).toEqual(new Set(['bruno']));
    expect(markedUidsAfterPress(new Set(['bruno', 'ana']), you, choices)).toEqual(new Set(['ana']));
  });

  it('Should keep the last marked person marked', () => {
    expect(markedUidsAfterPress(new Set(['ana']), ana, choices)).toEqual(new Set(['ana']));
  });

  it('Should not change the set it receives', () => {
    const marked = new Set(['bruno']);

    markedUidsAfterPress(marked, ana, choices);

    expect(marked).toEqual(new Set(['bruno']));
  });
});
