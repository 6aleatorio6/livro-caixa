import { personOf } from '@/shared/testing/personOf';

import { chipSelectionOf } from './chipSelectionOf';
import { memberChoicesOf } from './memberChoicesOf';

// Quem está logado é o Bruno: o chip dele é o "Você", e os outros vêm pelo primeiro nome.
const people = [personOf('bruno', 'Bruno'), personOf('ana', 'Ana'), personOf('clara', 'Clara')];
const choices = memberChoicesOf(people, 'bruno');

describe('chipSelectionOf', () => {
  it('Should select only "Você" while nobody was marked', () => {
    expect(chipSelectionOf({ mode: 'one', markedUids: new Set() }, choices, 'bruno')).toEqual({
      kind: 'me',
      markedUids: new Set(['bruno']),
      rowUids: new Set(['bruno']),
    });
  });

  it('Should name the marked people in the order of the chips, whatever the order they were marked in', () => {
    expect(chipSelectionOf({ mode: 'several', markedUids: new Set(['clara', 'bruno']) }, choices, 'bruno')).toEqual({
      kind: 'several',
      names: ['Você', 'Clara'],
      markedUids: new Set(['bruno', 'clara']),
      rowUids: new Set(['bruno', 'clara']),
    });
  });

  it('Should select another person alone, who is not "Você"', () => {
    expect(chipSelectionOf({ mode: 'one', markedUids: new Set(['ana']) }, choices, 'bruno')).toEqual({
      kind: 'other',
      name: 'Ana',
      markedUids: new Set(['ana']),
      rowUids: new Set(['ana']),
    });
  });

  it('Should leave out who left the list', () => {
    expect(chipSelectionOf({ mode: 'several', markedUids: new Set(['ana', 'dora']) }, choices, 'bruno')).toEqual({
      kind: 'other',
      name: 'Ana',
      markedUids: new Set(['ana']),
      rowUids: new Set(['ana']),
    });
  });

  it('Should go back to "Você" when only who left the list was marked', () => {
    expect(chipSelectionOf({ mode: 'one', markedUids: new Set(['dora']) }, choices, 'bruno').kind).toBe('me');
  });

  // Com todos, as partes de qualquer uid entram na lista (inclusive as de quem já saiu): `rowUids` é `null`.
  it('Should select every person in "Todos", showing the parts of any uid', () => {
    expect(chipSelectionOf({ mode: 'everyone', markedUids: new Set() }, choices, 'bruno')).toEqual({
      kind: 'everyone',
      markedUids: new Set(['bruno', 'ana', 'clara']),
      rowUids: null,
    });
  });

  // A Dora entra na família com a tela em "Todos": ela entra junto, sem tirar a tela de "Todos".
  it('Should keep "Todos" with whoever enters the family', () => {
    const withDora = memberChoicesOf([...people, personOf('dora', 'Dora')], 'bruno');

    expect(
      chipSelectionOf({ mode: 'everyone', markedUids: new Set(['bruno', 'ana', 'clara']) }, withDora, 'bruno'),
    ).toEqual({
      kind: 'everyone',
      markedUids: new Set(['bruno', 'ana', 'clara', 'dora']),
      rowUids: null,
    });
  });

  // Enquanto a lista de pessoas carrega só "Você" tem chip: "Todos" escolhido continua "Todos".
  it('Should keep "Todos" while "Você" is the only chip', () => {
    expect(
      chipSelectionOf({ mode: 'everyone', markedUids: new Set() }, memberChoicesOf([], 'bruno'), 'bruno').kind,
    ).toBe('everyone');
  });

  // "Todos" é o modo, não a conta dos chips: em "Várias" com todos marcados, o título nomeia as pessoas.
  it('Should not take every person marked in "Várias" for "Todos"', () => {
    expect(
      chipSelectionOf({ mode: 'several', markedUids: new Set(['bruno', 'ana', 'clara']) }, choices, 'bruno').kind,
    ).toBe('several');
  });
});
