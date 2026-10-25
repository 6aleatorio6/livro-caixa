import { createInputSmartWrapper } from '@/shared/utils/form/createInputSmartWrapper';

import { ReceiptField } from '@/shared/components/inputs/ReceiptField/ReceiptField';

/** O `ReceiptField` ligado a um formulário pelo `control` e pelo `name`. */
export const ReceiptFieldSmart = createInputSmartWrapper(ReceiptField);
