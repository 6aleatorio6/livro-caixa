import { hideToast } from '@/core/utils/storeActions/hideToast';
import { payRecurringBillService } from '@/shared/services/entry/add/payRecurringBillService';
import {
  payRecurringBillRejectedScenarios,
  payRecurringBillScenarios,
} from '@/shared/services/entry/add/payRecurringBillService.scenarios';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

import { doPayRecurringBill } from './doPayRecurringBill';

// Mocks com fábrica: o React Native Firebase não roda no Jest.
jest.mock('@/shared/services/entry/add/payRecurringBillService', () => ({ payRecurringBillService: jest.fn() }));
jest.mock('@/shared/utils/notifications/notifyFamilyOfEntry', () => ({ notifyFamilyOfEntry: jest.fn() }));

const scenario = payRecurringBillScenarios.memberPaysBill;
const [{ bill, month, amountCents }] = scenario.input;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  hideToast();
  jest.useRealTimers();
});

describe('doPayRecurringBill', () => {
  it('Should tell the family about the payment, with the id of the month and the bill, once the service resolves', async () => {
    mockServiceScenario(payRecurringBillService, scenario);

    await doPayRecurringBill(...scenario.input);

    expect(payRecurringBillService).toHaveBeenCalledWith(...scenario.input);
    expect(notifyFamilyOfEntry).toHaveBeenCalledWith({
      kind: 'recurringPayment',
      id: `${month}_${bill.id}`,
      month,
      name: bill.name,
      amountCents,
    });
  });

  it('Should finish the save without waiting for the notification to reach the family', async () => {
    mockServiceScenario(payRecurringBillService, scenario);
    // O envio nunca termina: a ação que esperasse por ele não resolveria, e o loader não sairia.
    jest.mocked(notifyFamilyOfEntry).mockReturnValue(new Promise(() => undefined));

    const { error } = await doPayRecurringBill(...scenario.input);

    expect(error).toBeNull();
    expect(notifyFamilyOfEntry).toHaveBeenCalledTimes(1);
  });

  it('Should not tell the family when the service refuses', async () => {
    mockServiceRejection(payRecurringBillService, payRecurringBillRejectedScenarios.billAlreadyPaidByAnother);

    const { error } = await doPayRecurringBill(...scenario.input);

    expect(error).not.toBeNull();
    expect(notifyFamilyOfEntry).not.toHaveBeenCalled();
  });
});
