import { getDoc, writeBatch } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';

import { payRecurringBillService } from './payRecurringBillService';
import { payRecurringBillScenarios } from './payRecurringBillService.scenarios';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn((_db, path: string) => ({ path })),
  doc: jest.fn((...args: unknown[]) => ({ args })),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'server-time'),
  writeBatch: jest.fn(),
}));
jest.mock('@/shared/services/firebase/firebaseAuth', () => ({
  firebaseAuth: { currentUser: { uid: 'uid-bruno', email: 'bruno.souza@exemplo.com' } },
}));
jest.mock('@/shared/services/firebase/firestoreDb', () => ({ firestoreDb: {} }));
jest.mock('@/shared/services/entry/addReceiptToBatch', () => ({ addReceiptToBatch: jest.fn() }));

const [payment] = payRecurringBillScenarios.memberPaysBill.input;
const batch = { set: jest.fn(), update: jest.fn(), commit: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
  jest.mocked(writeBatch).mockReturnValue(batch as never);
  jest.mocked(addReceiptToBatch).mockResolvedValue('f1');
  batch.commit.mockResolvedValue(undefined);
});

describe('payRecurringBillService', () => {
  // A corrida entre dois membros: os dois leem o mês sem pagamento, e o lote do segundo encontra o documento do primeiro.
  it('Should say the bill was already paid when the batch is denied because another member paid first', async () => {
    batch.commit.mockRejectedValue(
      Object.assign(new Error('permission-denied'), { code: 'firestore/permission-denied' }),
    );

    const refusal = payRecurringBillService(payment);

    await expect(refusal).rejects.toBeInstanceOf(AppError);
    await expect(refusal).rejects.toMatchObject({
      code: 'ALREADY_PAID',
      userMessage: 'Esta conta já foi paga neste mês.',
    });
  });

  it('Should keep any other failure of the batch as it is', async () => {
    const unavailable = Object.assign(new Error('unavailable'), { code: 'firestore/unavailable' });
    batch.commit.mockRejectedValue(unavailable);

    await expect(payRecurringBillService(payment)).rejects.toBe(unavailable);
  });

  it('Should copy to the payment the due day clamped to the month and the expected amount of the bill', async () => {
    const lastDayBill: IRecurringPaymentInput['bill'] = { ...payment.bill, dayOfMonth: 31, expectedAmountCents: 20000 };

    await payRecurringBillService({ ...payment, bill: lastDayBill, month: '2026-04', amountCents: 21000 });

    expect(batch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ month: '2026-04', amountCents: 21000, dueDay: 30, expectedAmountCents: 20000 }),
    );
  });
});
