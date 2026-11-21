import { skipBillMonthService } from '@/shared/services/billMonth/skip/skipBillMonthService';
import { monthName } from '@/shared/utils/date/monthName';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { doUndoSkipBillMonth } from './doUndoSkipBillMonth';

export const doSkipBillMonth = createAsyncAction({
  run: skipBillMonthService,
  shouldShowLoader: true,
  successMessage: ({ bill, month }) => `${bill.name} de ${monthName(month)} pulada.`,
  successAction: ({ bill, month }) => ({
    label: 'Desfazer',
    onPress: () => {
      doUndoSkipBillMonth({ bill, month });
    },
  }),
});
