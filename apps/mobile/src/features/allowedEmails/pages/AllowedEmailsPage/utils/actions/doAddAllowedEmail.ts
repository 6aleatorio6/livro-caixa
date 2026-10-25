import { addAllowedEmailService } from '@/shared/services/allowedEmail/add/addAllowedEmailService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// Sem aviso de sucesso: a pessoa nova aparece na lista, que é a resposta.
export const doAddAllowedEmail = createAsyncAction({ run: addAllowedEmailService });
