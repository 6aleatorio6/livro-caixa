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
  readAmountCents: null,
};

/** Envia o formulário preenchido com o nome e a data dados e devolve os erros que o schema achou. */
async function submit({ name = 'Farmácia', date = '2026-09-30' }: { name?: string; date?: string }) {
  const { result } = await renderHook(() => useOneOffBillForm(undefined, { name, amountCents: 8990, date, receipt }));
  const onValid = jest.fn();
  const onInvalid = jest.fn();

  await act(async () => result.current.handleSubmit(onValid, onInvalid)());

  return { onValid, errors: onInvalid.mock.calls[0]?.[0] as Record<string, { message?: string }> | undefined };
}

const submitWithDate = (date: string) => submit({ date });

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

  it('Should accept a name of 60 characters', async () => {
    const { onValid } = await submit({ name: 'a'.repeat(60) });

    expect(onValid).toHaveBeenCalledTimes(1);
  });

  it('Should refuse a name of 61 characters', async () => {
    const { onValid, errors } = await submit({ name: 'a'.repeat(61) });

    expect(errors?.name?.message).toBe('Use no máximo 60 caracteres.');
    expect(onValid).not.toHaveBeenCalled();
  });

  // A Geladeira de R$ 300,00, de setembro, com R$ 200,00 de contribuições.
  describe('With contributions', () => {
    async function submitChanged({ amountCents, date }: { amountCents: number; date: string }) {
      const { result } = await renderHook(() =>
        useOneOffBillForm(
          { contributedCents: 20000, lockedMonth: '2026-09' },
          { name: 'Geladeira', amountCents, date, receipt },
        ),
      );
      const onValid = jest.fn();
      const onInvalid = jest.fn();
      await act(async () => result.current.handleSubmit(onValid, onInvalid)());
      return { onValid, errors: onInvalid.mock.calls[0]?.[0] as Record<string, { message?: string }> | undefined };
    }

    it('Should refuse an amount below the sum of the contributions', async () => {
      const { errors } = await submitChanged({ amountCents: 19999, date: '2026-09-30' });

      expect(errors?.amountCents?.message).toBe('O valor não fica abaixo das contribuições, de R$ 200,00.');
    });

    it('Should accept an amount equal to the sum of the contributions, with the date in the same month', async () => {
      const { onValid } = await submitChanged({ amountCents: 20000, date: '2026-09-01' });

      expect(onValid).toHaveBeenCalledTimes(1);
    });

    it('Should refuse a date in another month', async () => {
      const { errors } = await submitChanged({ amountCents: 30000, date: '2026-10-01' });

      expect(errors?.date?.message).toBe('Com contribuições, a data fica em setembro.');
    });
  });
});
