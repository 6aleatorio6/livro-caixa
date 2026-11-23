import { hideToast } from '@/core/utils/storeActions/hideToast';
import { payOverdueBillService } from '@/shared/services/entry/add/payOverdueBillService';
import {
  payOverdueBillRejectedScenarios,
  payOverdueBillScenarios,
} from '@/shared/services/entry/add/payOverdueBillService.scenarios';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

import { doPayOverdueBill } from './doPayOverdueBill';

// Mocks com fábrica: o React Native Firebase não roda no Jest.
jest.mock('@/shared/services/entry/add/payOverdueBillService', () => ({ payOverdueBillService: jest.fn() }));
jest.mock('@/shared/utils/notifications/notifyFamilyOfEntry', () => ({ notifyFamilyOfEntry: jest.fn() }));

const scenario = payOverdueBillScenarios.memberPaysOverdueBill;
const [{ bill, billMonth, amountCents }] = scenario.input;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  hideToast();
  jest.useRealTimers();
});

describe('doPayOverdueBill', () => {
  it('Should tell the family about the payment, with the id the service returned and the overdue month', async () => {
    mockServiceScenario(payOverdueBillService, scenario);

    await doPayOverdueBill(...scenario.input);

    expect(payOverdueBillService).toHaveBeenCalledWith(...scenario.input);
    expect(notifyFamilyOfEntry).toHaveBeenCalledWith({
      kind: 'overduePayment',
      id: scenario.result,
      month: billMonth,
      name: bill.name,
      amountCents,
    });
  });

  it('Should finish the save without waiting for the notification to reach the family', async () => {
    mockServiceScenario(payOverdueBillService, scenario);
    // O envio nunca termina: a ação que esperasse por ele não resolveria, e o loader não sairia.
    jest.mocked(notifyFamilyOfEntry).mockReturnValue(new Promise(() => undefined));

    const { error } = await doPayOverdueBill(...scenario.input);

    expect(error).toBeNull();
    expect(notifyFamilyOfEntry).toHaveBeenCalledTimes(1);
  });

  it('Should not tell the family when the service refuses', async () => {
    mockServiceRejection(payOverdueBillService, payOverdueBillRejectedScenarios.billAlreadyPaidLaterByAnother);

    const { error } = await doPayOverdueBill(...scenario.input);

    expect(error).not.toBeNull();
    expect(notifyFamilyOfEntry).not.toHaveBeenCalled();
  });
});
