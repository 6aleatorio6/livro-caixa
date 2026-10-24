import type { IToast } from './Toast';

export interface IToastState {
  /** `null` enquanto nenhum aviso está na tela. */
  toast: IToast | null;
}
