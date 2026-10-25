import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { MoneyField } from '@/shared/components/inputs/MoneyField/MoneyField';

/** O `MoneyField` ligado a um formulário pelo `control` e pelo `name`. */
export const MoneyFieldSmart = createInputSmartWrapper(MoneyField);
