import { router, useLocalSearchParams } from 'expo-router';

import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import type { IReceipt } from '@/shared/types/file/Receipt';

/**
 * Para a tela aberta pelo compartilhamento do Android (`shared=1` na rota): o comprovante compartilhado que o campo
 * abre preenchido (`null` fora do compartilhamento) e a saída depois do registro. O comprovante guardado se esvazia
 * quando a tela de compartilhar sai da pilha, que é o que `dismissTo` faz.
 */
export function useSharedReceiptOpening(): { initialReceipt: IReceipt | null; finish: () => void } {
  const { shared } = useLocalSearchParams<{ shared?: string }>();
  const isShared = shared === '1';
  const sharedReceipt = useSharedReceiptStore((state) => state.receipt);

  return {
    initialReceipt: isShared ? sharedReceipt : null,
    finish: () => {
      if (isShared) router.dismissTo('/');
      else router.back();
    },
  };
}
