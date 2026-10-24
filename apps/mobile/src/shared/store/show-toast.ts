import { hideToast } from './hide-toast';
import type { IToastKind } from './toast-kind';
import { useToastStore } from './toast.store';

const TOAST_DURATION_MS = 4000;

let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** Mostra o aviso e o esconde sozinho. Um aviso novo substitui o anterior e conta o tempo de novo. */
export function showToast(message: string, kind: IToastKind = 'success') {
  clearTimeout(hideTimer);
  useToastStore.setState({ message, kind, isVisible: true });
  hideTimer = setTimeout(hideToast, TOAST_DURATION_MS);
}
