import { changeOwnNameService } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// Sem aviso de sucesso: o nome novo aparece em Configurações, para onde a tela volta.
export const doChangeOwnName = createAsyncAction({ run: changeOwnNameService });
