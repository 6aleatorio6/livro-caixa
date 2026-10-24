import { create } from 'zustand';

import type { IToastState } from './toast-state';

/** O aviso que aparece por cima de qualquer tela. Muda só por `showToast` e `hideToast`. */
export const useToastStore = create<IToastState>(() => ({ message: '', kind: 'success', isVisible: false }));
