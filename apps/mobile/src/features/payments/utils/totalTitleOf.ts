import { joinNames } from '@/shared/utils/format/joinNames';
import { monthName } from '@/shared/utils/date/monthName';

import type { IChipSelection } from '../types/ChipSelection';

/**
 * O título do cartão do total, pelo que está marcado: "Sua parte em outubro", "Parte de Bruno em outubro", "Partes de
 * Você e Bruno em outubro" ("Você, Ana e Bruno" com três ou mais) e, com todos, "A família registrou em outubro".
 */
export function totalTitleOf(selection: IChipSelection, month: string) {
  const monthLabel = monthName(month);

  switch (selection.kind) {
    case 'everyone':
      return `A família registrou em ${monthLabel}`;
    case 'me':
      return `Sua parte em ${monthLabel}`;
    case 'other':
      return `Parte de ${selection.name} em ${monthLabel}`;
    case 'several':
      return `Partes de ${joinNames(selection.names)} em ${monthLabel}`;
  }
}
