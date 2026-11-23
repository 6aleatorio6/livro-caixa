import { skipOverdueMonthService } from '@/shared/services/overdueMonth/skip/skipOverdueMonthService';
import { monthName } from '@/shared/utils/date/monthName';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

import { doUndoSkipOverdueMonth } from './doUndoSkipOverdueMonth';

export const doSkipOverdueMonth = createAsyncAction({
  run: skipOverdueMonthService,
  shouldShowLoader: true,
  successMessage: ({ bill, month }) => `${bill.name} de ${monthName(month)} pulada.`,
  successAction: ({ bill, month }) => ({
    label: 'Desfazer',
    onPress: () => {
      doUndoSkipOverdueMonth({ bill, month });
    },
  }),
});
