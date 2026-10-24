import type { IToastKind } from './ToastKind';

export interface IToastState {
  message: string;
  kind: IToastKind;
  isVisible: boolean;
}
