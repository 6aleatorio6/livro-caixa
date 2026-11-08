import { personOf } from '@/shared/testing/personOf';

import { memberChoicesOf } from './memberChoicesOf';
import { peopleFilterAfterPress } from './peopleFilterAfterPress';

// Quem está logado é o Bruno: o chip dele é o "Você", o primeiro.
const people = [personOf('bruno', 'Bruno'), personOf('ana', 'Ana'), personOf('clara', 'Clara')];
const choices = memberChoicesOf(people, 'bruno');
const [you, ana, clara] = choices;

describe('peopleFilterAfterPress', () => {
  it('Should swap the marked person for the pressed one in "Uma pessoa"', () => {
    expect(peopleFilterAfterPress({ mode: 'one', markedUids: new Set(['bruno']) }, ana, choices)).toEqual({
      mode: 'one',
      markedUids: new Set(['ana']),
    });
  });

  it('Should add a person who is not marked, keeping the others, in "Várias"', () => {
    expect(peopleFilterAfterPress({ mode: 'several', markedUids: new Set(['bruno']) }, ana, choices)).toEqual({
      mode: 'several',
      markedUids: new Set(['bruno', 'ana']),
    });
  });

  it('Should unmark a marked person while others remain marked, in "Várias"', () => {
    expect(peopleFilterAfterPress({ mode: 'several', markedUids: new Set(['bruno', 'ana']) }, ana, choices)).toEqual({
      mode: 'several',
      markedUids: new Set(['bruno']),
    });
  });

  it('Should keep the last marked person marked in "Várias"', () => {
    expect(peopleFilterAfterPress({ mode: 'several', markedUids: new Set(['ana']) }, ana, choices)).toEqual({
      mode: 'several',
      markedUids: new Set(['ana']),
    });
  });

  it('Should go to "Todos" when the last person left is marked in "Várias"', () => {
    expect(peopleFilterAfterPress({ mode: 'several', markedUids: new Set(['bruno', 'ana']) }, clara, choices)).toEqual({
      mode: 'everyone',
      markedUids: new Set(['bruno', 'ana', 'clara']),
    });
  });

  it('Should go to "Várias", with the others still marked, when a person is unmarked in "Todos"', () => {
    const everyone = new Set(['bruno', 'ana', 'clara']);

    expect(peopleFilterAfterPress({ mode: 'everyone', markedUids: everyone }, you, choices)).toEqual({
      mode: 'several',
      markedUids: new Set(['ana', 'clara']),
    });
  });

  // Com só o "Você", ele é sempre a última marcada: "Todos" não vale por ele estar marcado.
  it('Should stay in "Várias" when "Você" is the only chip', () => {
    expect(
      peopleFilterAfterPress({ mode: 'several', markedUids: new Set(['bruno']) }, you, memberChoicesOf([], 'bruno')),
    ).toEqual({ mode: 'several', markedUids: new Set(['bruno']) });
  });

  it('Should not change the set it receives', () => {
    const marked = new Set(['bruno']);

    peopleFilterAfterPress({ mode: 'several', markedUids: marked }, ana, choices);

    expect(marked).toEqual(new Set(['bruno']));
  });
});
