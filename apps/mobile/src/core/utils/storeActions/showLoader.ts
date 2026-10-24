import { useLoaderStore } from '@/core/store/loader.store';

export function showLoader() {
  useLoaderStore.setState({ isVisible: true });
}
