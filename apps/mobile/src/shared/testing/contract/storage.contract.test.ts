import { putFile, ref } from '@react-native-firebase/storage';

import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';
import { signInWithFakeGoogleService } from '@/shared/services/auth/signInWithFakeGoogleService';

describe('Storage nos testes de contrato', () => {
  it('Should refuse an upload while storage.rules deny everything', async () => {
    await signInWithFakeGoogleService({ email: 'bruno.souza@exemplo.com', name: 'Bruno Souza' });
    await expect(putFile(ref(firebaseStorage, 'receipts/receipt.png'), RECEIPT_FIXTURE.uri)).rejects.toMatchObject({
      code: 'storage/unauthorized',
    });
  });
});
