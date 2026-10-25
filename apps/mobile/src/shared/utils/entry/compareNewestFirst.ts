/** A parte do documento do lançamento que a ordem lê; o resto dos campos passa. */
interface ISortableEntry {
  [field: string]: unknown;
  date?: string | null;
  /** O `Timestamp` do lançamento; `null` enquanto o servidor ainda não respondeu com a hora. */
  createdAt?: { toMillis(): number } | null;
}

/** A hora do lançamento em milissegundos; o que o servidor ainda não carimbou acabou de ser lançado. */
const createdAtMillis = ({ createdAt }: ISortableEntry) => createdAt?.toMillis() ?? Number.POSITIVE_INFINITY;

/**
 * Ordena do mais recente para o mais antigo pela data e, na mesma data, pela hora do lançamento: o lançamento
 * ainda pendente no servidor conta como o mais novo. Sem data, vai para o fim.
 */
export function compareNewestFirst(first: ISortableEntry, second: ISortableEntry) {
  const byDate = (second.date ?? '').localeCompare(first.date ?? '');
  if (byDate !== 0) return byDate;

  const firstMillis = createdAtMillis(first);
  const secondMillis = createdAtMillis(second);
  return firstMillis === secondMillis ? 0 : secondMillis > firstMillis ? 1 : -1;
}
