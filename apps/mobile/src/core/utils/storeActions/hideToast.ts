import { useToastStore } from '@/core/store/toast.store';

import { toastHideTimer } from './toastHideTimer';

/** Esconde o aviso agora, e o timer que o esconderia depois, que o botão da ação ou o fim do tempo deixariam armado. */
export function hideToast() {
  clearTimeout(toastHideTimer.id);
  useToastStore.setState({ toast: null });
}
