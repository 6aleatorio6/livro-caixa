import { writeBatch } from '@react-native-firebase/firestore';

import { addReceiptToBatch } from '@/shared/services/entry/addReceiptToBatch';
import type { IOverduePaymentInput } from '@/shared/types/entry/OverduePaymentInput';

import { payOverdueBillService } from './payOverdueBillService';
import { payOverdueBillScenarios } from './payOverdueBillService.scenarios';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn((_db, path: string) => ({ path })),
  doc: jest.fn((...args: unknown[]) => ({ id: 'o1', args })),
  serverTimestamp: jest.fn(() => 'server-time'),
  writeBatch: jest.fn(),
}));
jest.mock('@/shared/services/firebase/firebaseAuth', () => ({
  firebaseAuth: { currentUser: { uid: 'uid-bruno', email: 'bruno.souza@exemplo.com' } },
}));
jest.mock('@/shared/services/firebase/firestoreDb', () => ({ firestoreDb: {} }));
jest.mock('@/shared/services/entry/addReceiptToBatch', () => ({ addReceiptToBatch: jest.fn() }));
// Dezembro tem 31 dias e novembro, 30: o dia do vencimento diz de que mês ele saiu.
jest.mock('@/shared/utils/date/currentMonth', () => ({ currentMonth: () => '2026-12' }));

const [payment] = payOverdueBillScenarios.memberPaysOverdueBill.input;
const batch = { set: jest.fn(), update: jest.fn(), commit: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(writeBatch).mockReturnValue(batch as never);
  jest.mocked(addReceiptToBatch).mockResolvedValue('f1');
  batch.commit.mockResolvedValue(undefined);
});

describe('payOverdueBillService', () => {
  it('Should copy the due day clamped to the month of the bill, not to the month of the payment', async () => {
    const lastDayBill: IOverduePaymentInput['bill'] = { ...payment.bill, dayOfMonth: 31 };

    await payOverdueBillService({ ...payment, bill: lastDayBill, billMonth: '2026-11' });

    expect(batch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ kind: 'overduePayment', month: '2026-12', billMonth: '2026-11', dueDay: 30 }),
    );
  });
});
