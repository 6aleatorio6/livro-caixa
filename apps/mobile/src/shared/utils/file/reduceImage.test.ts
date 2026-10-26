import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';

import type { ILocalFile } from '@/shared/types/file/LocalFile';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { reduceImage } from './reduceImage';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { WEBP: 'webp' },
}));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const FITS = RECEIPT_MAX_BYTES;
const TOO_BIG = RECEIPT_MAX_BYTES + 1;

/** O tamanho de cada arquivo salvo, pela `uri` (`{lado maior}-{qualidade}`); o que não está aqui não cabe. */
let savedSizes: Record<string, number | null> = {};

function savedUri(maxDimension: number, quality: number) {
  return `file:///cache/ImageManipulator/${maxDimension}-${quality}.webp`;
}

/** Uma imagem decodificada, com o `saveAsync` que salva em `savedUri`. */
function imageRef(width: number, height: number) {
  const maxDimension = Math.max(width, height);
  return {
    width,
    height,
    saveAsync: jest.fn(async ({ compress }: { compress: number }) => ({
      uri: savedUri(maxDimension, compress),
      width,
      height,
    })),
  };
}

/**
 * O manipulador: a primeira renderização é a foto aberta no limite (`decoded`); cada `resize` seguinte renderiza a
 * imagem com o lado maior pedido, na proporção da decodificada.
 */
function manipulatorOpening(decoded: ReturnType<typeof imageRef>) {
  jest.mocked(ImageManipulator.manipulate).mockImplementation((() => {
    let size: { width?: number; height?: number } | null = null;
    const context: { resize: jest.Mock; renderAsync: jest.Mock } = {
      resize: jest.fn((requested: { width?: number; height?: number }) => {
        size = requested;
        return context;
      }),
      renderAsync: jest.fn(async () => {
        if (!size) return decoded;
        const ratio = decoded.width / decoded.height;
        return size.width
          ? imageRef(size.width, Math.round(size.width / ratio))
          : imageRef(Math.round(size.height! * ratio), size.height!);
      }),
    };
    return context;
  }) as never);
}

function pickedFile(contentType: string, sizeBytes = TOO_BIG): ILocalFile {
  return { uri: 'file:///storage/Download/boleto-luz', name: 'boleto-luz.jpg', contentType, sizeBytes };
}

/** As tentativas, em ordem, como `{lado maior}-{qualidade}`. */
function attempts() {
  return jest.mocked(File).mock.calls.map(([uri]) => String(uri).match(/(\d+-[\d.]+)\.webp$/)![1]);
}

beforeEach(() => {
  jest.clearAllMocks();
  savedSizes = {};
  jest
    .mocked(File)
    .mockImplementation(((uri: string) => ({ size: uri in savedSizes ? savedSizes[uri] : TOO_BIG })) as never);
  manipulatorOpening(imageRef(4000, 3000));
});

describe('reduceImage', () => {
  it('Should leave an image of up to 900 KiB untouched', async () => {
    const image = pickedFile('image/png', FITS);

    expect(await reduceImage(image)).toBe(image);
    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });

  it('Should open the photo bounded to 2560 pixels and keep the first save that fits, as WebP', async () => {
    manipulatorOpening(imageRef(2560, 1920));
    savedSizes[savedUri(2560, 0.82)] = 700_000;
    const image = pickedFile('image/jpeg');

    expect(await reduceImage(image)).toEqual({
      uri: savedUri(2560, 0.82),
      name: 'boleto-luz.jpg',
      contentType: 'image/webp',
      sizeBytes: 700_000,
    });
    expect(ImageManipulator.manipulate).toHaveBeenCalledWith(image.uri, { maxWidth: 2560, maxHeight: 2560 });
  });

  it('Should lower the quality before the resolution', async () => {
    manipulatorOpening(imageRef(2560, 1920));
    savedSizes[savedUri(2560, 0.6)] = FITS;
    savedSizes[savedUri(2048, 0.6)] = 500_000;

    expect(await reduceImage(pickedFile('image/jpeg'))).toMatchObject({ uri: savedUri(2560, 0.6), sizeBytes: FITS });
    expect(attempts()).toEqual(['2560-0.82', '2560-0.7', '2560-0.6']);
  });

  it('Should shrink the longest side to 2048 and then to 1600 when no quality at 2560 fits', async () => {
    manipulatorOpening(imageRef(2560, 1920));
    savedSizes[savedUri(1600, 0.5)] = 400_000;

    expect(await reduceImage(pickedFile('image/jpeg'))).toMatchObject({ uri: savedUri(1600, 0.5), sizeBytes: 400_000 });
    expect(attempts()).toEqual(['2560-0.82', '2560-0.7', '2560-0.6', '2560-0.5', '2048-0.6', '2048-0.5', '1600-0.5']);
  });

  it('Should resize a portrait image by its height', async () => {
    manipulatorOpening(imageRef(1920, 2560));
    savedSizes[savedUri(2048, 0.6)] = 600_000;

    await reduceImage(pickedFile('image/jpeg'));

    const resize = jest.mocked(ImageManipulator.manipulate).mock.results[1].value.resize;
    expect(resize).toHaveBeenCalledWith({ height: 2048 });
  });

  it('Should not enlarge an image smaller than the step', async () => {
    manipulatorOpening(imageRef(1500, 1000));

    await reduceImage(pickedFile('image/png'));

    // Só a abertura passou pelo manipulador: os degraus de 2048 e 1600 salvam a mesma imagem de 1500 px.
    expect(ImageManipulator.manipulate).toHaveBeenCalledTimes(1);
    expect(attempts()).toEqual(['1500-0.82', '1500-0.7', '1500-0.6', '1500-0.5', '1500-0.6', '1500-0.5', '1500-0.5']);
  });

  it('Should return the original when not even the floor of 1600 pixels at 0.5 fits', async () => {
    const image = pickedFile('image/jpeg');

    expect(await reduceImage(image)).toBe(image);
  });

  it('Should skip a save whose file cannot be read and try the next step', async () => {
    manipulatorOpening(imageRef(2560, 1920));
    savedSizes[savedUri(2560, 0.82)] = null;
    savedSizes[savedUri(2560, 0.7)] = 0;
    savedSizes[savedUri(2560, 0.6)] = 800_000;

    expect(await reduceImage(pickedFile('image/webp'))).toMatchObject({ uri: savedUri(2560, 0.6), sizeBytes: 800_000 });
  });

  it.each(['image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])(
    'Should reduce an %s',
    async (contentType) => {
      savedSizes[savedUri(2560, 0.82)] = 1024;

      expect(await reduceImage(pickedFile(contentType))).toMatchObject({ contentType: 'image/webp', sizeBytes: 1024 });
    },
  );

  it('Should leave a GIF and a PDF untouched', async () => {
    for (const contentType of ['image/gif', 'application/pdf']) {
      const file = pickedFile(contentType);
      expect(await reduceImage(file)).toBe(file);
    }

    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });

  it('Should return the original when the reduction throws', async () => {
    jest.mocked(ImageManipulator.manipulate).mockImplementation(() => {
      throw new Error('memória insuficiente');
    });
    const image = pickedFile('image/jpeg');

    expect(await reduceImage(image)).toBe(image);
  });
});
