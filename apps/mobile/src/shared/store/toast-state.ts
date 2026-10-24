import type { IToastKind } from './toast-kind';

export interface IToastState {
  message: string;
  kind: IToastKind;
  isVisible: boolean;
}
