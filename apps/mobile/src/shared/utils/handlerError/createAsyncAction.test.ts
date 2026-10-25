import { AppError } from '@/shared/exceptions/AppError';
import { useLoaderStore } from '@/core/store/loader.store';
import { useToastStore } from '@/core/store/toast.store';

import { createAsyncAction } from './createAsyncAction';

beforeEach(() => {
  // O aviso se esconde sozinho num timer: com o relógio falso, nenhum fica pendente depois do teste.
  jest.useFakeTimers();
  useToastStore.setState({ toast: null });
  useLoaderStore.setState({ isVisible: false });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('createAsyncAction', () => {
  it('Should return the data and show the success message', async () => {
    const save = createAsyncAction({ run: async () => 'conta-1', successMessage: 'Conta salva' });

    const result = await save();

    expect(result).toEqual({ data: 'conta-1', error: null });
    expect(useToastStore.getState().toast).toEqual({ message: 'Conta salva', kind: 'success' });
  });

  it('Should choose the success message from the params of the call', async () => {
    const remove = createAsyncAction({
      run: async (_kind: 'payment' | 'bill') => undefined,
      successMessage: (kind) => (kind === 'payment' ? 'Pagamento excluído' : 'Conta excluída'),
    });

    await remove('bill');

    expect(useToastStore.getState().toast).toEqual({ message: 'Conta excluída', kind: 'success' });
  });

  it('Should show the user message of an AppError', async () => {
    const error = new AppError('Payment already registered', 'Essa conta já foi paga neste mês.');
    const pay = createAsyncAction({
      run: async () => {
        throw error;
      },
    });

    const result = await pay();

    expect(result).toEqual({ data: null, error });
    expect(useToastStore.getState().toast).toEqual({ message: 'Essa conta já foi paga neste mês.', kind: 'error' });
  });

  it('Should show a generic message for an unexpected error', async () => {
    const pay = createAsyncAction({
      run: async () => {
        throw new Error('rede caiu');
      },
    });

    await pay();

    expect(useToastStore.getState().toast).toEqual({ message: 'Algo deu errado. Tente de novo.', kind: 'error' });
  });

  it('Should cover the screen while running and uncover it when it fails', async () => {
    let failRun!: (error: Error) => void;
    const pay = createAsyncAction({
      run: () =>
        new Promise<void>((_resolve, reject) => {
          failRun = reject;
        }),
      shouldShowLoader: true,
    });

    const running = pay();
    expect(useLoaderStore.getState().isVisible).toBe(true);
    failRun(new Error('rede caiu'));
    await running;

    expect(useLoaderStore.getState().isVisible).toBe(false);
  });

  it('Should uncover the screen when it succeeds', async () => {
    const save = createAsyncAction({ run: async () => 'ok', shouldShowLoader: true });

    await save();

    expect(useLoaderStore.getState().isVisible).toBe(false);
  });
});
