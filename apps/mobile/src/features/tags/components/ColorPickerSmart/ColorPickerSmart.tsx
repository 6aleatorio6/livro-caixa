import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { ColorPicker } from '@/features/tags/components/ColorPicker/ColorPicker';

/** O `ColorPicker` ligado a um formulário pelo `control` e pelo `name`. */
export const ColorPickerSmart = createInputSmartWrapper(ColorPicker);
