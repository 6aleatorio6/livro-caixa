import { useToastStore } from './toast.store';

export function hideToast() {
  useToastStore.setState({ isVisible: false });
}
