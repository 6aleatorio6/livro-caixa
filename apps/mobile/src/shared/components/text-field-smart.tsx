import { createInputSmartWrapper } from '@/shared/forms/create-input-smart-wrapper';

import { TextField } from './text-field';

/** O `TextField` ligado a um formulário pelo `form` e pelo `name`. */
export const TextFieldSmart = createInputSmartWrapper(TextField);
