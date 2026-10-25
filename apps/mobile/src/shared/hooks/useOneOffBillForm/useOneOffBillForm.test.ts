import { act, renderHook } from '@testing-library/react-native';

import type { IReceipt } from '@/shared/types/file/Receipt';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

import { useOneOffBillForm } from './useOneOffBillForm';

const receipt: IReceipt = {
  uri: 'file:///recibo.png',
  name: 'recibo.png',
  contentType: 'image/png',
  sizeBytes: 100,
  type: 'image',
  wasReduced: false,
};

/** Envia o formulário preenchido com a data dada e devolve os erros que o schema achou. */
async function submitWithDate(date: string) {
  const { result } = await renderHook(() =>
    useOneOffBillForm(undefined, { name: 'Farmácia', amountCents: 8990, date, receipt }),
  );
  const onValid = jest.fn();
  const onInvalid = jest.fn();

  await act(async () => result.current.handleSubmit(onValid, onInvalid)());

  return { onValid, errors: onInvalid.mock.calls[0]?.[0] as Record<string, { message?: string }> | undefined };
}

describe('useOneOffBillForm', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 25), advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Should refuse a date after today, even when it did not come from the calendar', async () => {
    const { onValid, errors } = await submitWithDate('2026-10-26');

    expect(errors?.date?.message).toBe('A data não pode passar de hoje.');
    expect(onValid).not.toHaveBeenCalled();
  });

  it('Should accept today', async () => {
    const { onValid } = await submitWithDate(toIsoDate(new Date()));

    expect(onValid).toHaveBeenCalledTimes(1);
  });

  it('Should accept a date in a past month', async () => {
    const { onValid } = await submitWithDate('2026-09-30');

    expect(onValid).toHaveBeenCalledTimes(1);
  });
});
