/** A contagem de pessoas por extenso: "1 pessoa", "3 pessoas". */
export function peopleCount(count: number) {
  return `${count} ${count === 1 ? 'pessoa' : 'pessoas'}`;
}
