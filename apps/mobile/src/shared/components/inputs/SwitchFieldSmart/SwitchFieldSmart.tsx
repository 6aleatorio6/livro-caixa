import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { SwitchField } from '@/shared/components/inputs/SwitchField/SwitchField';

/** O `SwitchField` ligado a um formulário pelo `control` e pelo `name`. */
export const SwitchFieldSmart = createInputSmartWrapper(SwitchField);
