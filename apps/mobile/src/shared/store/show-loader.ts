import { useLoaderStore } from './loader.store';

export function showLoader() {
  useLoaderStore.setState({ isVisible: true });
}
