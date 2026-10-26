import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getReceiptContentService } from '@/shared/services/file/getReceiptContentService';
import {
  getReceiptContentFailedScenarios,
  getReceiptContentScenarios,
} from '@/shared/services/file/getReceiptContentService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { useReceiptContent } from './useReceiptContent';

jest.mock('@/shared/services/file/getReceiptContentService', () => ({ getReceiptContentService: jest.fn() }));

const scenario = getReceiptContentScenarios.receiptOfAnotherMember;
const [fileId, contentType] = scenario.input;
const file = { id: fileId, contentType };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReceiptContent', () => {
  it('Should ask for nothing and stay loading while the record has not arrived', async () => {
    const { result } = await renderHook(() => useReceiptContent(null));

    expect(result.current.status).toBe('loading');
    expect(getReceiptContentService).not.toHaveBeenCalled();
  });

  it('Should ask for the content of the record with its type', async () => {
    mockServiceScenario(getReceiptContentService, scenario);
    const { result } = await renderHook(() => useReceiptContent(file));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(getReceiptContentService).toHaveBeenCalledWith(...scenario.input);
    expect(result.current.uri).toBe(scenario.result);
  });

  it('Should treat an error that is not a missing content as a failure the person can retry, and ask again on retry', async () => {
    // O erro do Firebase como o contrato o viu passar: com o `code` do cenário, e não um `AppError`.
    const failure = getReceiptContentFailedScenarios.outsiderAsksForContent;
    jest
      .mocked(getReceiptContentService)
      .mockRejectedValueOnce(Object.assign(new Error('permission-denied'), failure.result));
    mockServiceScenario(getReceiptContentService, scenario);
    const { result } = await renderHook(() => useReceiptContent(file));

    await waitFor(() => expect(result.current.status).toBe('error'));
    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.uri).toBe(scenario.result);
    expect(getReceiptContentService).toHaveBeenCalledTimes(2);
  });

  it('Should turn a ready content into a failure when the image does not open', async () => {
    mockServiceScenario(getReceiptContentService, scenario);
    const { result } = await renderHook(() => useReceiptContent(file));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => result.current.fail());

    expect(result.current.status).toBe('error');
    expect(result.current.uri).toBeNull();
  });
});
