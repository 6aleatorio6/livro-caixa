import { renderHook, waitFor } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import { useIncomingShare } from 'expo-sharing';

import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import { reduceImage } from '@/shared/utils/file/reduceImage';
import { clearSharedReceipt } from '@/shared/utils/sharedReceipt/clearSharedReceipt';

import { useSharedReceipt } from './useSharedReceipt';

jest.mock('expo-sharing', () => ({ useIncomingShare: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));
// A redução da imagem usa o módulo nativo de manipulação, que não roda no Jest.
jest.mock('@/shared/utils/file/reduceImage', () => ({ reduceImage: jest.fn(async (file) => file) }));

const clearSharedPayloads = jest.fn();

function shareOf(payload: { name: string; type: string; size: number | null } | null, overrides = {}) {
  jest.mocked(useIncomingShare).mockReturnValue({
    sharedPayloads: payload
      ? [{ value: `content://x/${payload.name}`, shareType: 'file', mimeType: payload.type }]
      : [],
    resolvedSharedPayloads: payload
      ? [
          {
            value: `content://x/${payload.name}`,
            shareType: 'file',
            contentType: 'file',
            contentUri: `file:///cache/${payload.name}`,
            contentMimeType: payload.type,
            originalName: payload.name,
            contentSize: payload.size,
          },
        ]
      : [],
    clearSharedPayloads,
    isResolving: false,
    error: null,
    refreshSharePayloads: jest.fn(),
    ...overrides,
  });
}

describe('useSharedReceipt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearSharedReceipt();
  });

  it('Should prepare a shared PDF, keep it in the store and clear the shared payloads', async () => {
    shareOf({ name: 'pix-agua-outubro.pdf', type: 'application/pdf', size: 120_000 });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toMatchObject({
      receipt: { name: 'pix-agua-outubro.pdf', type: 'pdf', sizeBytes: 120_000 },
    });
    expect(useSharedReceiptStore.getState().receipt?.name).toBe('pix-agua-outubro.pdf');
    expect(clearSharedPayloads).toHaveBeenCalledTimes(1);
  });

  it('Should prepare a shared image', async () => {
    shareOf({ name: 'foto.jpg', type: 'image/jpeg', size: 300_000 });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current).toMatchObject({ receipt: { type: 'image' } });
  });

  it('Should reject a PDF over 900 KB with the message of the rule', async () => {
    shareOf({ name: 'grande.pdf', type: 'application/pdf', size: 6 * 1024 * 1024 });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('rejected'));
    expect(result.current).toMatchObject({ message: 'O PDF passa de 900 KB. Escolha outro arquivo.' });
    expect(useSharedReceiptStore.getState().receipt).toBeNull();
  });

  it('Should reject a file that is neither an image nor a PDF', async () => {
    shareOf({ name: 'musica.mp3', type: 'audio/mpeg', size: 1000 });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('rejected'));
    expect(result.current).toMatchObject({ message: 'O arquivo não é uma imagem nem um PDF. Escolha outro arquivo.' });
  });

  it('Should read the size from the file when the provider does not report it', async () => {
    jest.mocked(File).mockImplementation(() => ({ size: 2048 }) as never);
    shareOf({ name: 'sem-tamanho.pdf', type: 'application/pdf', size: null });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(File).toHaveBeenCalledWith('file:///cache/sem-tamanho.pdf');
    expect(result.current).toMatchObject({ receipt: { sizeBytes: 2048 } });
  });

  it('Should reject an empty file', async () => {
    jest.mocked(File).mockImplementation(() => ({ size: 0 }) as never);
    shareOf({ name: 'vazio.pdf', type: 'application/pdf', size: null });

    const { result } = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(result.current.status).toBe('rejected'));
    expect(result.current).toMatchObject({ message: 'Não deu para ler o arquivo. Escolha outro.' });
  });

  it('Should drop the previous receipt when the new share is rejected', async () => {
    shareOf({ name: 'pix.pdf', type: 'application/pdf', size: 1000 });
    const first = await renderHook(() => useSharedReceipt());
    await waitFor(() => expect(first.result.current.status).toBe('ready'));

    shareOf({ name: 'musica.mp3', type: 'audio/mpeg', size: 1000 });
    const second = await renderHook(() => useSharedReceipt());

    await waitFor(() => expect(second.result.current.status).toBe('rejected'));
    expect(useSharedReceiptStore.getState().receipt).toBeNull();
  });

  it('Should be empty when nothing was shared', async () => {
    shareOf(null);

    const { result } = await renderHook(() => useSharedReceipt());

    expect(result.current).toEqual({ status: 'empty' });
    expect(clearSharedPayloads).not.toHaveBeenCalled();
  });

  it('Should keep resolving while the shared file is being resolved', async () => {
    shareOf(null, {
      sharedPayloads: [{ value: 'content://x/pix.pdf', shareType: 'file', mimeType: 'application/pdf' }],
      isResolving: true,
    });

    const { result } = await renderHook(() => useSharedReceipt());

    expect(result.current).toEqual({ status: 'resolving' });
  });

  it('Should leave the rejection while another file is prepared', async () => {
    shareOf({ name: 'musica.mp3', type: 'audio/mpeg', size: 1000 });
    const { result, rerender } = await renderHook(() => useSharedReceipt());
    await waitFor(() => expect(result.current.status).toBe('rejected'));

    jest.mocked(reduceImage).mockReturnValueOnce(new Promise(() => {}));
    shareOf({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 });
    await rerender({});

    expect(result.current).toEqual({ status: 'resolving' });
  });

  it('Should not show the previous receipt as ready while the next file is prepared', async () => {
    shareOf({ name: 'pix.pdf', type: 'application/pdf', size: 1000 });
    const { result, rerender } = await renderHook(() => useSharedReceipt());
    await waitFor(() => expect(result.current.status).toBe('ready'));

    jest.mocked(reduceImage).mockReturnValueOnce(new Promise(() => {}));
    shareOf({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 });
    await rerender({});

    expect(result.current).toEqual({ status: 'resolving' });
    expect(useSharedReceiptStore.getState().receipt).toBeNull();
  });

  it('Should prepare the same file once when the payload object changes', async () => {
    shareOf({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 });
    const { result, rerender } = await renderHook(() => useSharedReceipt());
    await waitFor(() => expect(result.current.status).toBe('ready'));

    shareOf({ name: 'foto.jpg', type: 'image/jpeg', size: 1000 });
    await rerender({});

    expect(reduceImage).toHaveBeenCalledTimes(1);
  });

  it('Should reject when the share could not be resolved', async () => {
    shareOf(null, { error: new Error('resolve failed') });

    const { result } = await renderHook(() => useSharedReceipt());

    expect(result.current.status).toBe('rejected');
  });
});
