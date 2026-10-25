import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';

import { totalExpectedCents } from './totalExpectedCents';

describe('totalExpectedCents', () => {
  it('Should add the expected amount of every bill', () => {
    expect(totalExpectedCents(recurringBillListQueryScenarios.fiveBills.result)).toBe(267790);
  });

  it('Should be zero without bills', () => {
    expect(totalExpectedCents(recurringBillListQueryScenarios.noBills.result)).toBe(0);
  });
});
