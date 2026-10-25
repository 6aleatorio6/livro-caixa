/** O mês de uma data 'AAAA-MM-DD', 'AAAA-MM': o lançamento entra no mês da sua data, não no do registro. */
export function monthOf(isoDate: string) {
  return isoDate.slice(0, 7);
}
