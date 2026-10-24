import { useToastStore } from '@/core/store/toast.store';

export function hideToast() {
  useToastStore.setState({ isVisible: false });
}
