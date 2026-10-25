/** A data 'AAAA-MM-DD' como data local (o `new Date('AAAA-MM-DD')` seria UTC e cairia no dia anterior). */
export function fromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(year, month - 1, day);
}
