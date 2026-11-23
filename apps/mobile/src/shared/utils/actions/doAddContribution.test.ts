import { hideToast } from '@/core/utils/storeActions/hideToast';
import { addContributionService } from '@/shared/services/entry/add/addContributionService';
import {
  addContributionRejectedScenarios,
  addContributionScenarios,
} from '@/shared/services/entry/add/addContributionService.scenarios';
import { ANA_OVERDUE_PAYMENT, NEW_RECEIPT } from '@/shared/testing/entryFixtures';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

import { doAddContribution } from './doAddContribution';

// Mocks com fábrica: o React Native Firebase não roda no Jest.
jest.mock('@/shared/services/entry/add/addContributionService', () => ({ addContributionService: jest.fn() }));
jest.mock('@/shared/utils/notifications/notifyFamilyOfEntry', () => ({ notifyFamilyOfEntry: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  hideToast();
  jest.useRealTimers();
});

describe('doAddContribution', () => {
  it('Should tell the family about the contribution, pointing at the entry that receives it', async () => {
    const scenario = addContributionScenarios.memberContributesToPaidEntry;
    const [{ target, amountCents }] = scenario.input;
    mockServiceScenario(addContributionService, scenario);

    await doAddContribution(...scenario.input);

    expect(addContributionService).toHaveBeenCalledWith(...scenario.input);
    expect(notifyFamilyOfEntry).toHaveBeenCalledWith({
      kind: 'contribution',
      targetId: target.entry.id,
      month: target.entry.month,
      name: target.entry.name,
      amountCents,
    });
  });

  it('Should point at the payment of the month, named after the bill, when the month had no payment yet', async () => {
    const scenario = addContributionScenarios.memberContributesToMonthWithoutPayment;
    const [{ target, amountCents }] = scenario.input;
    mockServiceScenario(addContributionService, scenario);

    await doAddContribution(...scenario.input);

    expect(notifyFamilyOfEntry).toHaveBeenCalledWith({
      kind: 'contribution',
      targetId: `${target.month}_${target.bill.id}`,
      month: target.month,
      name: target.bill.name,
      amountCents,
    });
  });

  it('Should write the month of the bill, not the month of the payment, for an overdue payment that receives it', async () => {
    const scenario = addContributionScenarios.memberContributesToPaidEntry;
    mockServiceScenario(addContributionService, scenario);

    await doAddContribution({ target: { entry: ANA_OVERDUE_PAYMENT }, amountCents: 4000, receipt: NEW_RECEIPT });

    expect(notifyFamilyOfEntry).toHaveBeenCalledWith(
      expect.objectContaining({ targetId: ANA_OVERDUE_PAYMENT.id, month: ANA_OVERDUE_PAYMENT.billMonth }),
    );
  });

  it('Should finish the save without waiting for the notification to reach the family', async () => {
    const scenario = addContributionScenarios.memberContributesToPaidEntry;
    mockServiceScenario(addContributionService, scenario);
    // O envio nunca termina: a ação que esperasse por ele não resolveria, e o loader não sairia.
    jest.mocked(notifyFamilyOfEntry).mockReturnValue(new Promise(() => undefined));

    const { error } = await doAddContribution(...scenario.input);

    expect(error).toBeNull();
    expect(notifyFamilyOfEntry).toHaveBeenCalledTimes(1);
  });

  it('Should not tell the family when the service refuses', async () => {
    const scenario = addContributionRejectedScenarios.contributesToEntryDeletedMeanwhile;
    mockServiceRejection(addContributionService, scenario);

    const { error } = await doAddContribution(...scenario.input);

    expect(error).not.toBeNull();
    expect(notifyFamilyOfEntry).not.toHaveBeenCalled();
  });
});
