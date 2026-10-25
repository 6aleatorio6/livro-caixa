import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';

export function clearSharedReceipt() {
  useSharedReceiptStore.setState({ receipt: null });
}
