import { create } from 'zustand';

import type { ISharedReceiptState } from '@/shared/types/file/SharedReceiptState';

/** O comprovante que chegou pelo compartilhamento do Android. Muda só por `setSharedReceipt` e `clearSharedReceipt`. */
export const useSharedReceiptStore = create<ISharedReceiptState>(() => ({ receipt: null }));
