import { removeAllowedEmailService } from '@/shared/services/allowedEmail/remove/removeAllowedEmailService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// O aviso "{Nome} saiu da lista" é da tela, depois do sucesso: o item some da lista, e o aviso é a prova.
export const doRemoveAllowedEmail = createAsyncAction({ run: removeAllowedEmailService });
