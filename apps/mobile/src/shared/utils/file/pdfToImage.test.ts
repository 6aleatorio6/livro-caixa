import PdfPageImage from '@dariyd/react-native-pdf-page-image';
import { File } from 'expo-file-system';

import type { ILocalFile } from '@/shared/types/file/LocalFile';
import { pdfToImage } from './pdfToImage';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const PDF: ILocalFile = {
  uri: 'file:///cache/boleto-luz.pdf',
  name: 'boleto-luz.pdf',
  contentType: 'application/pdf',
  sizeBytes: 300_000,
};
const PAGE_URI = 'file:///cache/pdf-page-image/0.png';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(PdfPageImage.open).mockResolvedValue({ uri: PDF.uri, pageCount: 1 });
  jest.mocked(PdfPageImage.generate).mockResolvedValue({ uri: PAGE_URI, width: 1810, height: 2560 });
  jest.mocked(File).mockImplementation((() => ({ size: 1_400_000 })) as never);
});

describe('pdfToImage', () => {
  it('Should draw the single page as a PNG with the longest side bounded to 2560 pixels, keeping the name chosen', async () => {
    expect(await pdfToImage(PDF)).toEqual({
      uri: PAGE_URI,
      name: 'boleto-luz.pdf',
      contentType: 'image/png',
      sizeBytes: 1_400_000,
    });
    expect(PdfPageImage.generate).toHaveBeenCalledWith(PDF.uri, 0, 10, { format: 'png', maxDimension: 2560 });
  });

  it('Should hand the library a file:// uri for a shared PDF, which comes as file:/ with a single slash', async () => {
    await pdfToImage({ ...PDF, uri: 'file:/data/user/0/dev.leonardolf.livrocaixa/cache/pix-agua.pdf' });

    const libraryUri = 'file:///data/user/0/dev.leonardolf.livrocaixa/cache/pix-agua.pdf';
    expect(PdfPageImage.open).toHaveBeenCalledWith(libraryUri);
    expect(PdfPageImage.generate).toHaveBeenCalledWith(libraryUri, 0, 10, { format: 'png', maxDimension: 2560 });
  });

  it('Should refuse a PDF of two pages', async () => {
    jest.mocked(PdfPageImage.open).mockResolvedValue({ uri: PDF.uri, pageCount: 2 });

    await expect(pdfToImage(PDF)).rejects.toMatchObject({
      code: 'RECEIPT_PDF_MULTIPAGE',
      userMessage: 'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.',
    });
    expect(PdfPageImage.generate).not.toHaveBeenCalled();
  });

  it.each([
    {
      description: 'the PDF cannot be opened (corrupted or with a password)',
      arrange: () => jest.mocked(PdfPageImage.open).mockRejectedValue(new Error('senha')),
    },
    {
      description: 'the PDF has no page',
      arrange: () => jest.mocked(PdfPageImage.open).mockResolvedValue({ uri: PDF.uri, pageCount: 0 }),
    },
    {
      description: 'the page cannot be drawn',
      arrange: () => jest.mocked(PdfPageImage.generate).mockRejectedValue(new Error('memória')),
    },
  ])('Should say the file cannot be read when $description', async ({ arrange }) => {
    arrange();

    await expect(pdfToImage(PDF)).rejects.toMatchObject({
      code: 'RECEIPT_UNREADABLE',
      userMessage: 'Não deu para ler o arquivo. Escolha outro.',
    });
  });
});
