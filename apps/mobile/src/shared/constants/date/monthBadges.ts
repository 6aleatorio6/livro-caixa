/**
 * O selo dos dois meses que o app destaca, com o texto e as cores do container do design: o do `MonthSwitcher` e as
 * pílulas do filtro do compartilhar.
 */
export const MONTH_BADGES = {
  current: { text: 'Este mês', background: 'primaryContainer', color: 'onPrimaryContainer' },
  next: { text: 'Mês que vem', background: 'tertiaryContainer', color: 'onTertiaryContainer' },
} as const;
