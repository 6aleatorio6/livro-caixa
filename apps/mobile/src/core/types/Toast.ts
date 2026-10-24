import type { IToastKind } from './ToastKind';

export interface IToast {
  message: string;
  kind: IToastKind;
}
