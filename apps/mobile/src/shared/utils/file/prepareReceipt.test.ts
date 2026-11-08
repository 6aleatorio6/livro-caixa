import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IOcrLine } from '@/shared/types/ocr/OcrLine';
import { ocrLinesOf } from '@/shared/testing/ocrLinesOf';
import { findReceiptAmount } from '@/shared/utils/receiptAmount/findReceiptAmount';
import { prepareReceipt } from './prepareReceipt';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { recognizeReceiptText } from './recognizeReceiptText';
import { reduceImage } from './reduceImage';

jest.mock('./reduceImage', () => ({ reduceImage: jest.fn() }));
jest.mock('./recognizeReceiptText', () => ({ recognizeReceiptText: jest.fn() }));
// O parser de verdade, que um teste troca por um que lança.
jest.mock('@/shared/utils/receiptAmount/findReceiptAmount', () => ({
  findReceiptAmount: jest.fn(
    jest.requireActual<typeof import('@/shared/utils/receiptAmount/findReceiptAmount')>(
      '@/shared/utils/receiptAmount/findReceiptAmount',
    ).findReceiptAmount,
  ),
}));

const MB = 1024 * 1024;

function file(contentType: string, sizeBytes: number): ILocalFile {
  return { uri: 'file:///cache/comprovante', name: 'comprovante', contentType, sizeBytes };
}

/** As linhas que o OCR leu num Pix do Inter: um valor só, sem rótulo. */
const PIX_LINES = ocrLinesOf('inter', 'Pix enviado', 'R$ 64,90', 'Sobre a transação');

/** Uma página lida sem nenhum valor em reais, como a capa ou os termos de um comprovante. */
const NO_AMOUNT_LINES = ocrLinesOf('Comprovante de transferência', 'Termos e condições');

/** O OCR devolve as linhas da página pedida; a que não existe vem nula, como no módulo nativo. */
function ocrReads(pages: IOcrLine[][]) {
  jest.mocked(recognizeReceiptText).mockImplementation(async (_uri, _isPdf, pageIndex) => pages[pageIndex] ?? null);
}

/** Os índices das páginas que o OCR foi chamado para ler, na ordem. */
function pageIndexesRead() {
  return jest.mocked(recognizeReceiptText).mock.calls.map(([, , pageIndex]) => pageIndex);
}

async function rejection(promise: Promise<unknown>) {
  return promise.then(
    () => null,
    (error: unknown) => error as AppError,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  // Por padrão a redução devolve o próprio arquivo, como faz com o que não vale reduzir.
  jest.mocked(reduceImage).mockImplementation(async (image) => image);
  // Por padrão o OCR não lê nada, como num binário sem o módulo.
  jest.mocked(recognizeReceiptText).mockResolvedValue(null);
});

describe('prepareReceipt', () => {
  it('Should send a JPEG of 3 MB to the reduction and mark it as reduced', async () => {
    const reduced = {
      uri: 'file:///cache/comprovante.webp',
      name: 'comprovante',
      contentType: 'image/webp',
      sizeBytes: 700 * 1024,
    };
    jest.mocked(reduceImage).mockResolvedValue(reduced);
    const original = file('image/jpeg', 3 * MB);

    expect(await prepareReceipt(original)).toEqual({
      ...reduced,
      type: 'image',
      wasReduced: true,
      readAmountCents: null,
    });
    expect(reduceImage).toHaveBeenCalledWith(original);
  });

  it.each([
    { description: 'a JPEG of 800 KB', contentType: 'image/jpeg', sizeBytes: 800 * 1024 },
    { description: 'a GIF of 800 KB', contentType: 'image/gif', sizeBytes: 800 * 1024 },
  ])('Should keep $description as it is when the reduction leaves it alone', async ({ contentType, sizeBytes }) => {
    const original = file(contentType, sizeBytes);

    expect(await prepareReceipt(original)).toEqual({
      ...original,
      type: 'image',
      wasReduced: false,
      readAmountCents: null,
    });
  });

  it('Should keep a PDF of exactly 900 KiB as it is, typed pdf and not reduced', async () => {
    const original = file('application/pdf', RECEIPT_MAX_BYTES);

    expect(await prepareReceipt(original)).toEqual({
      ...original,
      type: 'pdf',
      wasReduced: false,
      readAmountCents: null,
    });
  });

  it('Should refuse a PDF over 900 KiB, since a PDF is not compressed', async () => {
    const error = await rejection(prepareReceipt(file('application/pdf', RECEIPT_MAX_BYTES + 1)));

    expect(error).toMatchObject({
      code: 'RECEIPT_TOO_LARGE',
      userMessage: 'O PDF passa de 900 KB. Escolha outro arquivo.',
    });
  });

  it('Should never send a PDF to the image reduction', async () => {
    await prepareReceipt(file('application/pdf', 300_000));

    expect(reduceImage).not.toHaveBeenCalled();
  });

  it('Should accept an image of exactly 900 KiB after the reduction', async () => {
    jest
      .mocked(reduceImage)
      .mockResolvedValue({ ...file('image/webp', RECEIPT_MAX_BYTES), uri: 'file:///cache/reduzida.webp' });

    expect(await prepareReceipt(file('image/jpeg', 3 * MB))).toMatchObject({
      type: 'image',
      sizeBytes: RECEIPT_MAX_BYTES,
      wasReduced: true,
    });
  });

  it('Should refuse an image that is still over 900 KiB after the reduction', async () => {
    jest
      .mocked(reduceImage)
      .mockResolvedValue({ ...file('image/webp', RECEIPT_MAX_BYTES + 1), uri: 'file:///cache/reduzida.webp' });

    const error = await rejection(prepareReceipt(file('image/jpeg', 9 * MB)));

    expect(error).toMatchObject({
      code: 'RECEIPT_TOO_LARGE',
      userMessage: 'Mesmo comprimida, a imagem passa de 900 KB. Escolha outro arquivo.',
    });
  });

  it.each(['text/plain', '', 'image/svg+xml', 'image/bmp'])(
    'Should refuse the content type "%s" as neither image nor PDF',
    async (contentType) => {
      const error = await rejection(prepareReceipt(file(contentType, MB)));

      expect(error).toMatchObject({
        code: 'RECEIPT_INVALID_TYPE',
        userMessage: 'O arquivo não é uma imagem nem um PDF. Escolha outro arquivo.',
      });
      expect(reduceImage).not.toHaveBeenCalled();
    },
  );

  it.each(['image/jpg', 'image/heic', 'image/heif', 'image/png'])(
    'Should accept the image type %s',
    async (contentType) => {
      expect(await prepareReceipt(file(contentType, 800 * 1024))).toMatchObject({ type: 'image' });
    },
  );

  it('Should refuse a file of size 0 as unreadable', async () => {
    const error = await rejection(prepareReceipt(file('application/pdf', 0)));

    expect(error).toMatchObject({
      code: 'RECEIPT_UNREADABLE',
      userMessage: 'Não deu para ler o arquivo. Escolha outro.',
    });
  });

  describe('The amount read from the receipt', () => {
    it('Should attach the amount read from the receipt', async () => {
      ocrReads([PIX_LINES]);
      const original = file('image/png', 300 * 1024);

      expect(await prepareReceipt(original)).toEqual({
        ...original,
        type: 'image',
        wasReduced: false,
        readAmountCents: 6490,
      });
    });

    it('Should read the reduced image, not the original', async () => {
      const reduced = { ...file('image/webp', 700 * 1024), uri: 'file:///cache/reduzida.webp' };
      jest.mocked(reduceImage).mockResolvedValue(reduced);

      await prepareReceipt(file('image/jpeg', 3 * MB));

      expect(recognizeReceiptText).toHaveBeenCalledWith('file:///cache/reduzida.webp', false, 0);
    });

    it('Should read a PDF as a PDF', async () => {
      const original = file('application/pdf', 30 * 1024);

      await prepareReceipt(original);

      expect(recognizeReceiptText).toHaveBeenCalledWith(original.uri, true, 0);
    });

    it('Should read an image as one page', async () => {
      ocrReads([NO_AMOUNT_LINES]);
      const original = file('image/png', 300 * 1024);

      await prepareReceipt(original);

      expect(recognizeReceiptText).toHaveBeenCalledTimes(1);
      expect(recognizeReceiptText).toHaveBeenCalledWith(original.uri, false, 0);
    });

    it('Should read the amount on the second page when the first has none', async () => {
      ocrReads([NO_AMOUNT_LINES, PIX_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: 6490 });
      expect(pageIndexesRead()).toEqual([0, 1]);
    });

    it('Should not look for the amount on the next page when this one shows two different amounts', async () => {
      ocrReads([ocrLinesOf('Valor', 'R$ 100,00', 'Tarifa', 'R$ 1,50'), ocrLinesOf('Tarifa', 'R$ 1,50')]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: null });
      expect(pageIndexesRead()).toEqual([0]);
    });

    it('Should read the amount on the third page', async () => {
      ocrReads([NO_AMOUNT_LINES, NO_AMOUNT_LINES, PIX_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: 6490 });
      expect(pageIndexesRead()).toEqual([0, 1, 2]);
    });

    it('Should read R$ 2.463,68 from the Itaú bill payment, whose amounts are all on the second page', async () => {
      // Transcrito da captura do comprovante do Itaú de 02/11/2026 (não é a saída do ML Kit), com os dados pessoais
      // trocados. A primeira página de verdade não tem valor em reais, por isso aqui basta uma página sem valor; a
      // segunda tem o pago duas vezes e os encargos zerados.
      const secondPage = ocrLinesOf(
        '2 de 2',
        'Data do pagamento:',
        '02/11/2026',
        'Valor do documento:',
        'R$ 2.463,68',
        'Desconto:',
        'R$ 0,00',
        'Juros/Mora:',
        'R$ 0,00',
        'Multa:',
        'R$ 0,00',
        'Total de encargos:',
        'R$ 0,00',
        'Valor pago:',
        'R$ 2.463,68',
        'Pagamento efetuado em',
        '02/11/2026 às 17:57:27 via MOBILE',
      );
      ocrReads([NO_AMOUNT_LINES, secondPage]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: 246368 });
    });

    it('Should not read the second page when the first has the amount', async () => {
      ocrReads([PIX_LINES, NO_AMOUNT_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: 6490 });
      expect(pageIndexesRead()).toEqual([0]);
    });

    it('Should read at most three pages', async () => {
      ocrReads(Array.from({ length: 5 }, () => NO_AMOUNT_LINES));

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: null });
      expect(pageIndexesRead()).toEqual([0, 1, 2]);
    });

    it('Should keep the amount empty when no page has one', async () => {
      ocrReads([NO_AMOUNT_LINES, NO_AMOUNT_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: null });
      expect(pageIndexesRead()).toEqual([0, 1, 2]);
    });

    it('Should keep reading after a page without text', async () => {
      ocrReads([[], PIX_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: 6490 });
      expect(pageIndexesRead()).toEqual([0, 1]);
    });

    it('Should stop at the first page the PDF does not have', async () => {
      ocrReads([NO_AMOUNT_LINES]);

      expect(await prepareReceipt(file('application/pdf', 30 * 1024))).toMatchObject({ readAmountCents: null });
      expect(pageIndexesRead()).toEqual([0, 1]);
    });

    it('Should attach null when the OCR reads nothing', async () => {
      expect(await prepareReceipt(file('image/png', 300 * 1024))).toMatchObject({ readAmountCents: null });
    });

    it('Should keep the receipt when reading the amount throws', async () => {
      ocrReads([PIX_LINES]);
      jest.mocked(findReceiptAmount).mockImplementationOnce(() => {
        throw new Error('O parser quebrou com as linhas lidas');
      });

      expect(await prepareReceipt(file('image/png', 300 * 1024))).toMatchObject({
        type: 'image',
        readAmountCents: null,
      });
    });

    it('Should not read a refused file', async () => {
      await rejection(prepareReceipt(file('application/pdf', RECEIPT_MAX_BYTES + 1)));

      expect(recognizeReceiptText).not.toHaveBeenCalled();
    });
  });
});
