/** A parte do documento do lançamento que a ordem lê; o resto dos campos passa. */
interface ISortableEntry {
  [field: string]: unknown;
  date?: string | null;
  /** O dia em que o pagamento de conta recorrente foi registrado; ele não tem `date`. */
  paidOn?: string;
  /** O `Timestamp` do lançamento; `null` enquanto o servidor ainda não respondeu com a hora. */
  createdAt?: { toMillis(): number } | null;
}

/** O dia do lançamento: a `date` da conta avulsa ou o `paidOn` do pagamento. */
const dayOf = ({ date, paidOn }: ISortableEntry) => date ?? paidOn ?? '';

/** A hora do lançamento em milissegundos; o que o servidor ainda não carimbou acabou de ser lançado. */
const createdAtMillis = ({ createdAt }: ISortableEntry) => createdAt?.toMillis() ?? Number.POSITIVE_INFINITY;

/**
 * Ordena do mais recente para o mais antigo pelo dia (a `date` da avulsa ou o `paidOn` do pagamento) e, no mesmo dia, pela hora do lançamento: o lançamento
 * ainda pendente no servidor conta como o mais novo. Sem dia, vai para o fim.
 */
export function compareNewestFirst(first: ISortableEntry, second: ISortableEntry) {
  const byDate = dayOf(second).localeCompare(dayOf(first));
  if (byDate !== 0) return byDate;

  const firstMillis = createdAtMillis(first);
  const secondMillis = createdAtMillis(second);
  return firstMillis === secondMillis ? 0 : secondMillis > firstMillis ? 1 : -1;
}
