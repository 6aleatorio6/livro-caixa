export interface IAsyncActionOptions<TParams, TData> {
  run: (params: TParams) => Promise<TData>;
  /** Cobre a tela com o carregamento enquanto `run` não termina. */
  shouldShowLoader?: boolean;
  /** O aviso de sucesso, quando a ação pede um; uma função o escolhe pelos parâmetros da chamada. */
  successMessage?: string | ((params: TParams) => string);
}
