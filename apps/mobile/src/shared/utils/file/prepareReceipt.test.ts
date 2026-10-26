import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import { prepareReceipt } from './prepareReceipt';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { reduceImage } from './reduceImage';

jest.mock('./reduceImage', () => ({ reduceImage: jest.fn() }));

const MB = 1024 * 1024;

function file(contentType: string, sizeBytes: number): ILocalFile {
  return { uri: 'file:///cache/comprovante', name: 'comprovante', contentType, sizeBytes };
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

    expect(await prepareReceipt(original)).toEqual({ ...reduced, type: 'image', wasReduced: true });
    expect(reduceImage).toHaveBeenCalledWith(original);
  });

  it.each([
    { description: 'a JPEG of 800 KB', contentType: 'image/jpeg', sizeBytes: 800 * 1024 },
    { description: 'a GIF of 800 KB', contentType: 'image/gif', sizeBytes: 800 * 1024 },
  ])('Should keep $description as it is when the reduction leaves it alone', async ({ contentType, sizeBytes }) => {
    const original = file(contentType, sizeBytes);

    expect(await prepareReceipt(original)).toEqual({ ...original, type: 'image', wasReduced: false });
  });

  it('Should never send a PDF to the reduction', async () => {
    const original = file('application/pdf', 800 * 1024);

    expect(await prepareReceipt(original)).toEqual({ ...original, type: 'pdf', wasReduced: false });
    expect(reduceImage).not.toHaveBeenCalled();
  });

  it('Should accept a PDF of exactly 900 KiB', async () => {
    expect(await prepareReceipt(file('application/pdf', RECEIPT_MAX_BYTES))).toMatchObject({ type: 'pdf' });
  });

  it('Should refuse a PDF of one byte over 900 KiB', async () => {
    const error = await rejection(prepareReceipt(file('application/pdf', RECEIPT_MAX_BYTES + 1)));

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      code: 'RECEIPT_TOO_LARGE',
      userMessage: 'O PDF passa de 900 KB. Escolha outro arquivo.',
    });
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
});
