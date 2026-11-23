import { errorUserMessage } from './errorUserMessage';
import { hideLoader } from '@/core/utils/storeActions/hideLoader';
import { showLoader } from '@/core/utils/storeActions/showLoader';
import { showToast } from '@/core/utils/storeActions/showToast';

import type { IAsyncActionOptions } from '@/shared/types/asyncAction/AsyncActionOptions';
import type { IAsyncActionResult } from '@/shared/types/asyncAction/AsyncActionResult';

/**
 * Embrulha uma chamada assíncrona com o retorno à pessoa: o carregamento, o aviso de sucesso (com o botão da ação, se
 * ela pede um) e o aviso de erro. A ação nunca lança: devolve `{ data, error }`.
 */
export function createAsyncAction<TParams = void, TData = void>({
  run,
  shouldShowLoader = false,
  successMessage,
  successAction,
}: IAsyncActionOptions<TParams, TData>) {
  return async (params: TParams): Promise<IAsyncActionResult<TData>> => {
    if (shouldShowLoader) showLoader();
    try {
      const data = await run(params);
      if (successMessage) {
        const message = typeof successMessage === 'function' ? successMessage(params) : successMessage;
        const action = successAction?.(params, data);
        if (action) showToast(message, 'success', action);
        else showToast(message, 'success');
      }
      return { data, error: null };
    } catch (error) {
      showToast(errorUserMessage(error), 'error');
      return { data: null, error };
    } finally {
      if (shouldShowLoader) hideLoader();
    }
  };
}
