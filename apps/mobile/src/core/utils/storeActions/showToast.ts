import { hideToast } from './hideToast';
import { toastHideTimer } from './toastHideTimer';
import type { IToast } from '@/core/types/Toast';
import type { IToastKind } from '@/core/types/ToastKind';
import { useToastStore } from '@/core/store/toast.store';

const TOAST_DURATION_MS = 4000;
// O aviso com ação dá tempo de ler a mensagem e de alcançar o botão.
const TOAST_WITH_ACTION_DURATION_MS = 6000;

/**
 * Mostra o aviso e o esconde sozinho: depois de 4 s, ou de 6 s se ele tem uma ação. Um aviso novo substitui o anterior e
 * conta o tempo de novo.
 */
export function showToast(message: string, kind: IToastKind = 'success', action?: IToast['action']) {
  clearTimeout(toastHideTimer.id);
  useToastStore.setState({ toast: { message, kind, ...(action && { action }) } });
  toastHideTimer.id = setTimeout(hideToast, action ? TOAST_WITH_ACTION_DURATION_MS : TOAST_DURATION_MS);
}
