import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { DateField } from '@/shared/components/inputs/DateField/DateField';

/** O `DateField` ligado a um formulário pelo `control` e pelo `name`. */
export const DateFieldSmart = createInputSmartWrapper(DateField);
