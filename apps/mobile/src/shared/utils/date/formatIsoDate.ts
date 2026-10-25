/** A data 'AAAA-MM-DD' como a pessoa lê: "01/01/2026". */
export function formatIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');

  return `${day}/${month}/${year}`;
}
