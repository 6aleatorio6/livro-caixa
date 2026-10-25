import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';

import { recurringBillFormValuesOf } from './recurringBillFormValuesOf';
import { recurringBillInputOf } from './recurringBillInputOf';

const THREE_TAGS = tagListQueryScenarios.threeTags.result;

describe('recurringBillFormValuesOf', () => {
  it.each(recurringBillListQueryScenarios.fiveBills.result)(
    'Should give back the bill $name when the form values go through recurringBillInputOf',
    ({ id, ...bill }) => {
      expect(recurringBillInputOf(recurringBillFormValuesOf({ id, ...bill }, THREE_TAGS))).toEqual(bill);
    },
  );

  it('Should start without the tag when it is not among the tags read', () => {
    const [bill] = recurringBillListQueryScenarios.billWithDeletedTag.result;

    expect(recurringBillFormValuesOf(bill, THREE_TAGS).tagId).toBeNull();
  });

  it('Should keep the tag of the bill when the tags could not be read', () => {
    const [bill] = recurringBillListQueryScenarios.billWithDeletedTag.result;

    expect(recurringBillFormValuesOf(bill, null).tagId).toBe(bill.tagId);
  });
});
