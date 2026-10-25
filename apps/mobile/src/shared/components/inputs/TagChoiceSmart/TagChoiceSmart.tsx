import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { TagChoice } from '@/shared/components/inputs/TagChoice/TagChoice';

/** O `TagChoice` ligado a um formulário pelo `control` e pelo `name`. */
export const TagChoiceSmart = createInputSmartWrapper(TagChoice);
