import { shareAsync } from 'expo-sharing';

import { shareReceipt } from './shareReceipt';

const mockFolders = new Set<string>();
const mockWrittenFiles = new Map<string, { content: string; encoding?: string }>();

// Um sistema de arquivos em memória: o `Directory` e o `File` juntam as partes do caminho, como o módulo nativo; o
// `exists` é o da hora em que a pasta é montada, como o `shareReceipt` o lê; a pasta some com o que tem dentro e, como no
// módulo, apagar a que não existe lança; o `write` guarda o que foi escrito.
jest.mock('expo-file-system', () => {
  const uriOf = (parts: (string | { uri: string })[]) =>
    parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
  return {
    Paths: { cache: { uri: 'file:///cache' } },
    Directory: jest.fn((...parts: (string | { uri: string })[]) => {
      const uri = uriOf(parts);
      return {
        uri,
        exists: mockFolders.has(uri),
        create: () => mockFolders.add(uri),
        delete: () => {
          if (!mockFolders.delete(uri)) throw new Error(`uri '${uri}' does not exist`);
          for (const path of mockWrittenFiles.keys()) if (path.startsWith(`${uri}/`)) mockWrittenFiles.delete(path);
        },
      };
    }),
    File: jest.fn((...parts: (string | { uri: string })[]) => {
      const uri = uriOf(parts);
      return {
        uri,
        write: async (content: string, options?: { encoding?: string }) =>
          void mockWrittenFiles.set(uri, { content, encoding: options?.encoding }),
      };
    }),
  };
});
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

const PDF_URI = 'data:application/pdf;base64,JVBERi0xLjcK';

beforeEach(() => {
  mockFolders.clear();
  mockWrittenFiles.clear();
  jest.clearAllMocks();
  jest.mocked(shareAsync).mockResolvedValue();
});

describe('shareReceipt', () => {
  it.each([
    { name: 'comprovante-luz.pdf', contentType: 'application/pdf', base64: 'JVBERi0xLjcK' },
    { name: 'pix-agua.png', contentType: 'image/png', base64: 'iVBORw0KGgo=' },
  ])(
    'Should share a copy of $name, with its name and type, written in the cache',
    async ({ name, contentType, base64 }) => {
      await shareReceipt({ file: { id: 'file-1', name, contentType }, uri: `data:${contentType};base64,${base64}` });

      const copyUri = `file:///cache/shared-receipts/${name}`;
      expect(mockWrittenFiles.get(copyUri)).toEqual({ content: base64, encoding: 'base64' });
      expect(shareAsync).toHaveBeenCalledWith(copyUri, {
        mimeType: contentType,
        dialogTitle: 'Compartilhar comprovante',
      });
    },
  );

  it.each([
    { case: 'a compressed image', name: 'foto-boleto.jpg', contentType: 'image/webp', sharedName: 'foto-boleto.webp' },
    {
      case: 'a name without extension',
      name: 'Boleto luz',
      contentType: 'application/pdf',
      sharedName: 'Boleto luz.pdf',
    },
    {
      case: 'a dot that is no extension',
      name: 'Boleto 10.11',
      contentType: 'application/pdf',
      sharedName: 'Boleto 10.11.pdf',
    },
    { case: 'another extension of the type', name: 'foto.jpeg', contentType: 'image/jpeg', sharedName: 'foto.jpeg' },
    { case: 'an extension in capitals', name: 'Recibo.PDF', contentType: 'application/pdf', sharedName: 'Recibo.PDF' },
  ])('Should end the name with the extension of its type, for $case', async ({ name, contentType, sharedName }) => {
    await shareReceipt({ file: { id: 'file-1', name, contentType }, uri: `data:${contentType};base64,AAAA` });

    expect(shareAsync).toHaveBeenCalledWith(`file:///cache/shared-receipts/${sharedName}`, {
      mimeType: contentType,
      dialogTitle: 'Compartilhar comprovante',
    });
  });

  it('Should keep the copy in its folder when the name has slashes', async () => {
    await shareReceipt({
      file: { id: 'file-1', name: '../../files/biometricsEnabled.txt', contentType: 'application/pdf' },
      uri: PDF_URI,
    });

    expect([...mockWrittenFiles.keys()]).toEqual(['file:///cache/shared-receipts/biometricsEnabled.txt.pdf']);
  });

  it('Should keep only the last shared copy in the cache', async () => {
    await shareReceipt({
      file: { id: 'file-1', name: 'comprovante-luz.pdf', contentType: 'application/pdf' },
      uri: PDF_URI,
    });
    await shareReceipt({ file: { id: 'file-2', name: 'pix-agua.pdf', contentType: 'application/pdf' }, uri: PDF_URI });

    expect([...mockWrittenFiles.keys()]).toEqual(['file:///cache/shared-receipts/pix-agua.pdf']);
  });

  it('Should say in Portuguese that it could not share when the Android share does not open', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const failure = new Error('Failed to share the file: no activity');
    jest.mocked(shareAsync).mockRejectedValue(failure);

    await expect(
      shareReceipt({
        file: { id: 'file-1', name: 'comprovante-luz.pdf', contentType: 'application/pdf' },
        uri: PDF_URI,
      }),
    ).rejects.toMatchObject({ name: 'AppError', userMessage: 'Não deu para compartilhar o comprovante.' });
    expect(warn).toHaveBeenCalledWith('Não deu para compartilhar o comprovante.', failure);
    warn.mockRestore();
  });
});
