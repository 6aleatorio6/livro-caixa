import { create } from 'zustand';

import type { ILoaderState } from '@/core/types/LoaderState';

/** O carregamento que cobre a tela inteira. Muda só por `showLoader` e `hideLoader`. */
export const useLoaderStore = create<ILoaderState>(() => ({ isVisible: false }));
