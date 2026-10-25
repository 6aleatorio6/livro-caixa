import { create } from 'zustand';

import type { IToastState } from '@/core/types/ToastState';

/** O aviso que aparece por cima de qualquer tela. Muda só por `showToast` e `hideToast`. */
export const useToastStore = create<IToastState>(() => ({ toast: null }));
