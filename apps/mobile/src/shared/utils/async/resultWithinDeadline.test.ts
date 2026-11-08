import { resultWithinDeadline } from './resultWithinDeadline';

const DEADLINE_MS = 3000;

/** Uma leitura que termina com o `result` depois de `delayMs`. */
function readingThatEndsAfter<TResult>(delayMs: number, result: TResult) {
  return new Promise<TResult>((resolve) => {
    setTimeout(() => resolve(result), delayMs);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('resultWithinDeadline', () => {
  it('Should deliver the result of a reading that ends within the deadline', async () => {
    const result = resultWithinDeadline(readingThatEndsAfter(1000, 'lido'), DEADLINE_MS);

    await jest.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toBe('lido');
  });

  it('Should deliver null when the reading ends after the deadline', async () => {
    const result = resultWithinDeadline(readingThatEndsAfter(5000, 'lido'), DEADLINE_MS);

    await jest.advanceTimersByTimeAsync(DEADLINE_MS);

    await expect(result).resolves.toBeNull();
  });

  it('Should clear its timer when the reading ends first', async () => {
    await resultWithinDeadline(Promise.resolve('lido'), DEADLINE_MS);

    expect(jest.getTimerCount()).toBe(0);
  });

  it('Should let the rejection of the reading pass through and clear its timer', async () => {
    const reading = Promise.reject(new Error('Falha na leitura'));

    await expect(resultWithinDeadline(reading, DEADLINE_MS)).rejects.toThrow('Falha na leitura');
    expect(jest.getTimerCount()).toBe(0);
  });

  describe('The onDeadline callback', () => {
    it('Should be called once when the deadline is over', async () => {
      const onDeadline = jest.fn();
      const result = resultWithinDeadline(readingThatEndsAfter(5000, 'lido'), DEADLINE_MS, onDeadline);

      await jest.advanceTimersByTimeAsync(DEADLINE_MS);
      await result;

      expect(onDeadline).toHaveBeenCalledTimes(1);
    });

    it('Should not be called when the reading ends first', async () => {
      const onDeadline = jest.fn();

      await resultWithinDeadline(Promise.resolve('lido'), DEADLINE_MS, onDeadline);
      await jest.advanceTimersByTimeAsync(DEADLINE_MS);

      expect(onDeadline).not.toHaveBeenCalled();
    });
  });
});
