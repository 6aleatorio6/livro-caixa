import { personOf } from '@/shared/testing/personOf';

import { chipSelectionOf } from './chipSelectionOf';
import { emptyTitleOf } from './emptyTitleOf';
import { memberChoicesOf } from './memberChoicesOf';

const people = [personOf('bruno', 'Bruno'), personOf('ana', 'Ana'), personOf('clara', 'Clara')];
const choices = memberChoicesOf(people, 'bruno');

// `EVERYONE` é o modo "Todos"; uma lista de uids são os chips marcados em "Várias".
const EVERYONE = 'everyone' as const;
const titleOf = (marked: string[] | typeof EVERYONE) =>
  emptyTitleOf(
    chipSelectionOf(
      marked === EVERYONE
        ? { mode: 'everyone', markedUids: new Set() }
        : { mode: 'several', markedUids: new Set(marked) },
      choices,
      'bruno',
    ),
    '2026-10',
  );

describe('emptyTitleOf', () => {
  it('Should say nothing of "Você" when only "Você" is marked', () => {
    expect(titleOf(['bruno'])).toBe('Nenhum pagamento seu em outubro');
  });

  it('Should name another person alone', () => {
    expect(titleOf(['clara'])).toBe('Nenhum pagamento de Clara em outubro');
  });

  it('Should speak of the chosen people when more than one is marked', () => {
    expect(titleOf(['bruno', 'ana'])).toBe('Nenhum pagamento das pessoas escolhidas em outubro');
  });

  it('Should speak of nobody in "Todos"', () => {
    expect(titleOf(EVERYONE)).toBe('Nenhum pagamento em outubro');
  });
});
