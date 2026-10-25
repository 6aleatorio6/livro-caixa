import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import type { IReceipt } from '@/shared/types/file/Receipt';

/** Guarda o comprovante compartilhado; um compartilhamento novo troca o anterior. */
export function setSharedReceipt(receipt: IReceipt) {
  useSharedReceiptStore.setState({ receipt });
}
