import type { IToast } from '@/core/types/Toast';

export interface IAsyncActionOptions<TParams, TData> {
  run: (params: TParams) => Promise<TData>;
  /** Cobre a tela com o carregamento enquanto `run` não termina. */
  shouldShowLoader?: boolean;
  /** O aviso de sucesso, quando a ação pede um; uma função o escolhe pelos parâmetros da chamada. */
  successMessage?: string | ((params: TParams) => string);
  /** O botão do aviso de sucesso ("Desfazer"), escolhido pelos parâmetros e pelo resultado; com `successMessage`. */
  successAction?: (params: TParams, data: TData) => IToast['action'];
}
