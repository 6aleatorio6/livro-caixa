/**
 * Os ids dos documentos de `collection` que o cenário gravou antes (`given`), em ordem de id: a ordem em que a leitura
 * da coleção os devolve, para a comparação não depender da ordem em que o cenário os lista.
 */
export function givenIdsOf(given: Record<string, object>, collection: string) {
  return Object.keys(given)
    .filter((path) => path.startsWith(`${collection}/`))
    .map((path) => path.slice(collection.length + 1))
    .sort();
}
