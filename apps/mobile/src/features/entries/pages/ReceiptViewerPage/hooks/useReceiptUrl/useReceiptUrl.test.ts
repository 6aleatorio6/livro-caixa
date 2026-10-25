import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getReceiptUrlService } from '@/shared/services/file/getReceiptUrlService';
import { getReceiptUrlFailedScenarios, getReceiptUrlScenarios } from '@/shared/services/file/getReceiptUrlService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { useReceiptUrl } from './useReceiptUrl';

jest.mock('@/shared/services/file/getReceiptUrlService', () => ({ getReceiptUrlService: jest.fn() }));

const scenario = getReceiptUrlScenarios.receiptOfAnotherMember;
const [storagePath] = scenario.input;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReceiptUrl', () => {
  it('Should ask for nothing and stay loading while the record has no path yet', async () => {
    const { result } = await renderHook(() => useReceiptUrl(null));

    expect(result.current.status).toBe('loading');
    expect(getReceiptUrlService).not.toHaveBeenCalled();
  });

  it('Should treat an error that is not a missing object as a failure the person can retry, and ask again on retry', async () => {
    // O erro do Firebase como o contrato o viu passar: com o `code` do cenário, e não um `AppError`.
    const failure = getReceiptUrlFailedScenarios.outsiderAsksForAddress;
    jest.mocked(getReceiptUrlService).mockRejectedValueOnce(Object.assign(new Error('unauthorized'), failure.result));
    mockServiceScenario(getReceiptUrlService, scenario);
    const { result } = await renderHook(() => useReceiptUrl(storagePath));

    await waitFor(() => expect(result.current.status).toBe('error'));
    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.url).toBe(scenario.result);
    expect(getReceiptUrlService).toHaveBeenCalledTimes(2);
  });

  it('Should turn a ready address into a failure when the file does not open', async () => {
    mockServiceScenario(getReceiptUrlService, scenario);
    const { result } = await renderHook(() => useReceiptUrl(storagePath));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => result.current.fail());

    expect(result.current.status).toBe('error');
    expect(result.current.url).toBeNull();
  });
});
