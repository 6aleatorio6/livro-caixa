/**
 * Quem os chips de Pagamentos deixam marcado, em quatro casos: é por eles que os títulos e o texto de cada linha
 * mudam.
 */
type IChipSelectionCase =
  /** Todos os chips de pessoa estão marcados (havendo mais de uma): o chip "Todos" fica marcado. */
  | { kind: 'everyone' }
  /** Só o chip de quem está logado está marcado. */
  | { kind: 'me' }
  /** Só o chip de uma outra pessoa está marcado: `name` é o rótulo dele. */
  | { kind: 'other'; name: string }
  /** Duas ou mais pessoas, mas não todas: `names` são os rótulos dos chips marcados, na ordem dos chips. */
  | { kind: 'several'; names: string[] };

export type IChipSelection = IChipSelectionCase & {
  /** Os uids dos chips de pessoa marcados: o que cada chip mostra e de onde o toque parte. */
  markedUids: ReadonlySet<string>;
  /** Os uids das partes que a lista mostra: os marcados, ou `null` com todos, que mostra as partes de qualquer uid. */
  rowUids: ReadonlySet<string> | null;
};
