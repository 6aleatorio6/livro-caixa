import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';

import { recurringBillsSupport } from './recurringBillsSupport';

describe('recurringBillsSupport', () => {
  it('Should give the count and the monthly total of several bills', () => {
    expect(recurringBillsSupport(recurringBillListQueryScenarios.fiveBills.result)).toBe('5 contas · R$ 2.677,90 por mês');
  });

  it('Should write one bill in the singular', () => {
    expect(recurringBillsSupport(recurringBillListQueryScenarios.billWithoutTag.result)).toBe('1 conta · R$ 120,00 por mês');
  });

  it('Should say there is no bill when the family has none', () => {
    expect(recurringBillsSupport(recurringBillListQueryScenarios.noBills.result)).toBe('Nenhuma conta');
  });
});
