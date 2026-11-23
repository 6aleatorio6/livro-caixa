import { hideToast } from '@/core/utils/storeActions/hideToast';
import { addOneOffBillService } from '@/shared/services/entry/add/addOneOffBillService';
import {
  addOneOffBillRejectedScenarios,
  addOneOffBillScenarios,
} from '@/shared/services/entry/add/addOneOffBillService.scenarios';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

import { doAddOneOffBill } from './doAddOneOffBill';

// Mocks com fábrica: o React Native Firebase não roda no Jest.
jest.mock('@/shared/services/entry/add/addOneOffBillService', () => ({ addOneOffBillService: jest.fn() }));
jest.mock('@/shared/utils/notifications/notifyFamilyOfEntry', () => ({ notifyFamilyOfEntry: jest.fn() }));

const scenario = addOneOffBillScenarios.memberAddsOneOffBill;
const [{ name, amountCents }] = scenario.input;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  hideToast();
  jest.useRealTimers();
});

describe('doAddOneOffBill', () => {
  it('Should tell the family about the one-off bill, with the id the service returned', async () => {
    mockServiceScenario(addOneOffBillService, scenario);

    await doAddOneOffBill(...scenario.input);

    expect(addOneOffBillService).toHaveBeenCalledWith(...scenario.input);
    expect(notifyFamilyOfEntry).toHaveBeenCalledWith({
      kind: 'oneOffBill',
      id: scenario.result,
      name,
      amountCents,
    });
  });

  it('Should finish the save without waiting for the notification to reach the family', async () => {
    mockServiceScenario(addOneOffBillService, scenario);
    // O envio nunca termina: a ação que esperasse por ele não resolveria, e o loader não sairia.
    jest.mocked(notifyFamilyOfEntry).mockReturnValue(new Promise(() => undefined));

    const { error } = await doAddOneOffBill(...scenario.input);

    expect(error).toBeNull();
    expect(notifyFamilyOfEntry).toHaveBeenCalledTimes(1);
  });

  it('Should not tell the family when the service refuses', async () => {
    mockServiceRejection(addOneOffBillService, addOneOffBillRejectedScenarios.receiptUnreadable);

    const { error } = await doAddOneOffBill(...scenario.input);

    expect(error).not.toBeNull();
    expect(notifyFamilyOfEntry).not.toHaveBeenCalled();
  });
});
