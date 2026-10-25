/** O dia do mês (1 a 31) de uma data 'AAAA-MM-DD'. */
export function dayOf(isoDate: string) {
  return Number(isoDate.slice(8, 10));
}
