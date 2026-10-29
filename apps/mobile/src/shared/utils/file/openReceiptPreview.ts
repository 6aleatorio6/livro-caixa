import { router } from 'expo-router';

import type { ILocalFile } from '@/shared/types/file/LocalFile';

/** Abre em tela cheia o comprovante ainda no celular (escolhido ou compartilhado), antes de ele ir para o Firestore. */
export function openReceiptPreview({ uri, name }: Pick<ILocalFile, 'uri' | 'name'>) {
  router.push({ pathname: '/receipt-preview', params: { uri, name } });
}
