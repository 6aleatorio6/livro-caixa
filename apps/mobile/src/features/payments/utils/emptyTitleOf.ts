import { monthName } from '@/shared/utils/date/monthName';

import type { IChipSelection } from '../types/ChipSelection';

/**
 * O título do mês sem lançamentos, pelo que está marcado: "Nenhum pagamento seu em outubro", "… de Bruno …", "… das
 * pessoas escolhidas …" com mais de uma e, com todos, "Nenhum pagamento em outubro".
 */
export function emptyTitleOf(selection: IChipSelection, month: string) {
  const monthLabel = monthName(month);

  switch (selection.kind) {
    case 'everyone':
      return `Nenhum pagamento em ${monthLabel}`;
    case 'me':
      return `Nenhum pagamento seu em ${monthLabel}`;
    case 'other':
      return `Nenhum pagamento de ${selection.name} em ${monthLabel}`;
    case 'several':
      return `Nenhum pagamento das pessoas escolhidas em ${monthLabel}`;
  }
}
