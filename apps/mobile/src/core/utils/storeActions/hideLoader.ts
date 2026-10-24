import { useLoaderStore } from '@/core/store/loader.store';

export function hideLoader() {
  useLoaderStore.setState({ isVisible: false });
}
