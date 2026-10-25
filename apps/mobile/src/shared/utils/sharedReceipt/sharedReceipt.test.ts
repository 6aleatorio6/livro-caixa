import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import type { IReceipt } from '@/shared/types/file/Receipt';

import { clearSharedReceipt } from './clearSharedReceipt';
import { setSharedReceipt } from './setSharedReceipt';

const receiptNamed = (name: string): IReceipt => ({
  uri: `file:///cache/${name}`,
  name,
  contentType: 'application/pdf',
  sizeBytes: 1000,
  type: 'pdf',
  wasReduced: false,
});

describe('Shared receipt store', () => {
  beforeEach(clearSharedReceipt);

  it('Should replace the previous receipt when another one is shared', () => {
    setSharedReceipt(receiptNamed('pix-agua.pdf'));
    setSharedReceipt(receiptNamed('boleto-internet.pdf'));

    expect(useSharedReceiptStore.getState().receipt?.name).toBe('boleto-internet.pdf');
  });

  it('Should empty the store when cleared', () => {
    setSharedReceipt(receiptNamed('pix-agua.pdf'));
    clearSharedReceipt();

    expect(useSharedReceiptStore.getState().receipt).toBeNull();
  });
});
