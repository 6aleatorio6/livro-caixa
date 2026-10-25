/** O que uma ação devolve: ela nunca lança, e quem chama decide pelo `error`. */
export type IAsyncActionResult<TData> = { data: TData; error: null } | { data: null; error: unknown };
