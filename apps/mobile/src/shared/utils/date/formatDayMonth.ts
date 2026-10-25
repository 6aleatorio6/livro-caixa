/** A data 'AAAA-MM-DD' só com o dia e o mês: "12/10". */
export function formatDayMonth(isoDate: string) {
  const [, month, day] = isoDate.split('-');

  return `${day}/${month}`;
}
