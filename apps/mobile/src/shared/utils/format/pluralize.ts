/** A contagem com a palavra no número certo: "1 conta", "5 contas". */
export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
