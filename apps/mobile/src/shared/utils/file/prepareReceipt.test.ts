import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import { prepareReceipt } from './prepareReceipt';
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
    const reduced = { uri: 'file:///cache/comprovante.webp', name: 'comprovante', contentType: 'image/webp', sizeBytes: MB };
    jest.mocked(reduceImage).mockResolvedValue(reduced);
    const original = file('image/jpeg', 3 * MB);

    expect(await prepareReceipt(original)).toEqual({ ...reduced, type: 'image', wasReduced: true });
    expect(reduceImage).toHaveBeenCalledWith(original);
  });

  it.each([
    { description: 'a JPEG of 1 MB', contentType: 'image/jpeg', sizeBytes: MB },
    { description: 'a GIF of 3 MB', contentType: 'image/gif', sizeBytes: 3 * MB },
  ])('Should keep $description as it is when the reduction leaves it alone', async ({ contentType, sizeBytes }) => {
    const original = file(contentType, sizeBytes);

    expect(await prepareReceipt(original)).toEqual({ ...original, type: 'image', wasReduced: false });
  });

  it('Should never send a PDF to the reduction', async () => {
    const original = file('application/pdf', 3 * MB);

    expect(await prepareReceipt(original)).toEqual({ ...original, type: 'pdf', wasReduced: false });
    expect(reduceImage).not.toHaveBeenCalled();
  });

  it('Should accept a PDF of exactly 5 MB', async () => {
    expect(await prepareReceipt(file('application/pdf', 5242880))).toMatchObject({ type: 'pdf' });
  });

  it('Should refuse a PDF of one byte over 5 MB', async () => {
    const error = await rejection(prepareReceipt(file('application/pdf', 5242881)));

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ code: 'RECEIPT_TOO_LARGE', userMessage: 'O PDF passa de 5 MB. Escolha outro arquivo.' });
  });

  it('Should refuse an image that is still over 5 MB after the reduction', async () => {
    jest.mocked(reduceImage).mockResolvedValue({ ...file('image/webp', 6 * MB), uri: 'file:///cache/reduzida.webp' });

    const error = await rejection(prepareReceipt(file('image/jpeg', 9 * MB)));

    expect(error).toMatchObject({ code: 'RECEIPT_TOO_LARGE', userMessage: 'A imagem passa de 5 MB. Escolha outro arquivo.' });
  });

  it.each(['text/plain', '', 'image/svg+xml', 'image/bmp'])('Should refuse the content type "%s" as neither image nor PDF', async (contentType) => {
    const error = await rejection(prepareReceipt(file(contentType, MB)));

    expect(error).toMatchObject({
      code: 'RECEIPT_INVALID_TYPE',
      userMessage: 'O arquivo não é uma imagem nem um PDF. Escolha outro arquivo.',
    });
    expect(reduceImage).not.toHaveBeenCalled();
  });

  it.each(['image/jpg', 'image/heic', 'image/heif', 'image/png'])('Should accept the image type %s', async (contentType) => {
    expect(await prepareReceipt(file(contentType, MB))).toMatchObject({ type: 'image' });
  });

  it('Should refuse a file of size 0 as unreadable', async () => {
    const error = await rejection(prepareReceipt(file('application/pdf', 0)));

    expect(error).toMatchObject({ code: 'RECEIPT_UNREADABLE', userMessage: 'Não deu para ler o arquivo. Escolha outro.' });
  });
});
