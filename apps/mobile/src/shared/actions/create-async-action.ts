import { errorUserMessage } from '@/shared/errors/error-user-message';
import { hideLoader } from '@/shared/store/hide-loader';
import { showLoader } from '@/shared/store/show-loader';
import { showToast } from '@/shared/store/show-toast';

import type { IAsyncActionOptions } from './async-action-options';
import type { IAsyncActionResult } from './async-action-result';

/**
 * Embrulha uma chamada assíncrona com o retorno à pessoa: o carregamento, o aviso de sucesso e o
 * aviso de erro. A ação nunca lança: devolve `{ data, error }`.
 */
export function createAsyncAction<TParams = void, TData = void>({
  run,
  shouldShowLoader = false,
  successMessage,
}: IAsyncActionOptions<TParams, TData>) {
  return async (params: TParams): Promise<IAsyncActionResult<TData>> => {
    if (shouldShowLoader) showLoader();
    try {
      const data = await run(params);
      if (successMessage) showToast(successMessage, 'success');
      return { data, error: null };
    } catch (error) {
      showToast(errorUserMessage(error), 'error');
      return { data: null, error };
    } finally {
      if (shouldShowLoader) hideLoader();
    }
  };
}
