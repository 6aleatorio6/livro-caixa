import { router } from 'expo-router';

import type { IReceipt } from '@/shared/types/file/Receipt';

/** Abre em tela cheia o comprovante ainda no celular (escolhido ou compartilhado), antes de ele ir para o Firestore. */
export function openReceiptPreview({ uri, name, type }: Pick<IReceipt, 'uri' | 'name' | 'type'>) {
  router.push({ pathname: '/receipt-preview', params: { uri, name, type } });
}
