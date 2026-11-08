import { personOf } from '@/shared/testing/personOf';

import { chipSelectionOf } from './chipSelectionOf';
import { memberChoicesOf } from './memberChoicesOf';
import { totalTitleOf } from './totalTitleOf';

// Quatro pessoas: com três marcadas ainda não são todas.
const people = [
  personOf('bruno', 'Bruno'),
  personOf('ana', 'Ana'),
  personOf('carla', 'Carla'),
  personOf('clara', 'Clara'),
];
const choices = memberChoicesOf(people, 'bruno');

// `EVERYONE` é o modo "Todos"; uma lista de uids são os chips marcados em "Várias".
const EVERYONE = 'everyone' as const;
const titleOf = (marked: string[] | typeof EVERYONE) =>
  totalTitleOf(
    chipSelectionOf(
      marked === EVERYONE
        ? { mode: 'everyone', markedUids: new Set() }
        : { mode: 'several', markedUids: new Set(marked) },
      choices,
      'bruno',
    ),
    '2026-10',
  );

describe('totalTitleOf', () => {
  it('Should say "Sua parte" when only "Você" is marked', () => {
    expect(titleOf(['bruno'])).toBe('Sua parte em outubro');
    expect(titleOf([])).toBe('Sua parte em outubro');
  });

  it('Should name another person alone', () => {
    expect(titleOf(['ana'])).toBe('Parte de Ana em outubro');
  });

  it('Should join the names of two people with "e", "Você" first', () => {
    expect(titleOf(['ana', 'bruno'])).toBe('Partes de Você e Ana em outubro');
  });

  it('Should join three or more names with commas and a final "e"', () => {
    expect(titleOf(['bruno', 'ana', 'carla'])).toBe('Partes de Você, Ana e Carla em outubro');
    expect(titleOf(['ana', 'carla', 'clara'])).toBe('Partes de Ana, Carla e Clara em outubro');
  });

  it('Should say the family registered in "Todos"', () => {
    expect(titleOf(EVERYONE)).toBe('A família registrou em outubro');
  });
});
