/** O mês andado `offset` meses, 'AAAA-MM': ('2026-01', -1) vira '2025-12'. */
export function shiftMonth(month: string, offset: number) {
  const [year, monthNumber] = month.split('-').map(Number);
  const index = year * 12 + (monthNumber - 1) + offset;

  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}
