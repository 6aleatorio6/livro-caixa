export interface IAsyncActionOptions<TParams, TData> {
  run: (params: TParams) => Promise<TData>;
  /** Cobre a tela com o carregamento enquanto `run` não termina. */
  shouldShowLoader?: boolean;
  /** O aviso de sucesso, quando a ação pede um. */
  successMessage?: string;
}
