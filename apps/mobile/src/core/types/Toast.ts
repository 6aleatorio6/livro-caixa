import type { IToastKind } from './ToastKind';

export interface IToast {
  message: string;
  kind: IToastKind;
  /** O botão à direita da mensagem ("Desfazer"); tocá-lo chama `onPress` e fecha o aviso. */
  action?: { label: string; onPress: () => void };
}
