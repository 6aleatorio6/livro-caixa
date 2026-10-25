/** A data pelos campos locais, 'AAAA-MM-DD' (o toISOString é UTC e viraria o dia à noite). */
export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}
