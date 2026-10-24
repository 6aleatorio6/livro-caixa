import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { TextField } from '@/shared/components/inputs/TextField/TextField';

/** O `TextField` ligado a um formulário pelo `control` e pelo `name`. */
export const TextFieldSmart = createInputSmartWrapper(TextField);
