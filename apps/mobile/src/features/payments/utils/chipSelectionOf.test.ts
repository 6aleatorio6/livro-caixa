import { personOf } from '@/shared/testing/personOf';

import { chipSelectionOf } from './chipSelectionOf';
import { memberChoicesOf } from './memberChoicesOf';

// Quem está logado é o Bruno: o chip dele é o "Você", e os outros vêm pelo primeiro nome.
const people = [personOf('bruno', 'Bruno'), personOf('ana', 'Ana'), personOf('clara', 'Clara')];
const choices = memberChoicesOf(people, 'bruno');

describe('chipSelectionOf', () => {
  it('Should select only "Você" while nobody was marked', () => {
    expect(chipSelectionOf(new Set(), choices, 'bruno')).toEqual({
      kind: 'me',
      markedUids: new Set(['bruno']),
      rowUids: new Set(['bruno']),
    });
  });

  it('Should name the marked people in the order of the chips, whatever the order they were marked in', () => {
    expect(chipSelectionOf(new Set(['clara', 'bruno']), choices, 'bruno')).toEqual({
      kind: 'several',
      names: ['Você', 'Clara'],
      markedUids: new Set(['bruno', 'clara']),
      rowUids: new Set(['bruno', 'clara']),
    });
  });

  it('Should select another person alone, who is not "Você"', () => {
    expect(chipSelectionOf(new Set(['ana']), choices, 'bruno')).toEqual({
      kind: 'other',
      name: 'Ana',
      markedUids: new Set(['ana']),
      rowUids: new Set(['ana']),
    });
  });

  it('Should leave out who left the list', () => {
    expect(chipSelectionOf(new Set(['ana', 'dora']), choices, 'bruno')).toEqual({
      kind: 'other',
      name: 'Ana',
      markedUids: new Set(['ana']),
      rowUids: new Set(['ana']),
    });
  });

  it('Should go back to "Você" when only who left the list was marked', () => {
    expect(chipSelectionOf(new Set(['dora']), choices, 'bruno').kind).toBe('me');
  });

  // Com todos, as partes de qualquer uid entram na lista (inclusive as de quem já saiu): `rowUids` é `null`.
  it('Should derive "Todos" from every person being marked, showing the parts of any uid', () => {
    expect(chipSelectionOf(new Set(['bruno', 'ana', 'clara']), choices, 'bruno')).toEqual({
      kind: 'everyone',
      markedUids: new Set(['bruno', 'ana', 'clara']),
      rowUids: null,
    });
  });

  // Enquanto a lista de pessoas carrega só "Você" tem chip, e "Todos" marcado trocaria o título por um instante.
  it('Should not mark "Todos" while "Você" is the only person', () => {
    expect(chipSelectionOf(new Set(), memberChoicesOf([], 'bruno'), 'bruno').kind).toBe('me');
  });
});
