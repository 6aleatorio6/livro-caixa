import { useLoaderStore } from './loader.store';

export function hideLoader() {
  useLoaderStore.setState({ isVisible: false });
}
