import { File } from 'expo-file-system';
import { ImageManipulator } from 'expo-image-manipulator';

import type { ILocalFile } from '@/shared/types/file/LocalFile';
import { IMAGE_REDUCTION_MIN_BYTES, reduceImage } from './reduceImage';

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { WEBP: 'webp' },
}));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const OVER_THE_THRESHOLD = IMAGE_REDUCTION_MIN_BYTES + 1;
const REDUCED_URI = 'file:///cache/ImageManipulator/boleto-luz.webp';

const saveAsync = jest.fn();

function pickedFile(contentType: string, sizeBytes = OVER_THE_THRESHOLD): ILocalFile {
  return { uri: 'file:///storage/Download/boleto-luz', contentType, sizeBytes };
}

function reducesTo(sizeBytes: number | null) {
  saveAsync.mockResolvedValue({ uri: REDUCED_URI, width: 2560, height: 1920 });
  (File as unknown as jest.Mock).mockImplementation(() => ({ size: sizeBytes }));
}

beforeEach(() => {
  jest.clearAllMocks();
  (ImageManipulator.manipulate as jest.Mock).mockReturnValue({
    renderAsync: jest.fn().mockResolvedValue({ saveAsync }),
  });
});

describe('reduceImage', () => {
  it('Should return the image saved again as WebP, with the longest side bounded to 2560 pixels', async () => {
    reducesTo(1024);
    const image = pickedFile('image/jpeg');

    expect(await reduceImage(image)).toEqual({ uri: REDUCED_URI, contentType: 'image/webp', sizeBytes: 1024 });
    expect(ImageManipulator.manipulate).toHaveBeenCalledWith(image.uri, { maxWidth: 2560, maxHeight: 2560 });
    expect(saveAsync).toHaveBeenCalledWith({ compress: 0.82, format: 'webp' });
  });

  it('Should leave an image of up to 2 MB untouched', async () => {
    const image = pickedFile('image/png', IMAGE_REDUCTION_MIN_BYTES);

    expect(await reduceImage(image)).toBe(image);
    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });

  it('Should leave a GIF and a PDF untouched', async () => {
    for (const contentType of ['image/gif', 'application/pdf']) {
      const file = pickedFile(contentType);
      expect(await reduceImage(file)).toBe(file);
    }

    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });

  it('Should return the original when the reduction did not make it smaller', async () => {
    reducesTo(OVER_THE_THRESHOLD);
    const image = pickedFile('image/png');

    expect(await reduceImage(image)).toBe(image);
  });

  it('Should return the original when the saved file cannot be read', async () => {
    for (const unreadableSize of [0, null]) {
      reducesTo(unreadableSize);
      const image = pickedFile('image/webp');
      expect(await reduceImage(image)).toBe(image);
    }
  });

  it('Should return the original when the reduction throws', async () => {
    saveAsync.mockRejectedValue(new Error('memória insuficiente'));
    const image = pickedFile('image/jpeg');

    expect(await reduceImage(image)).toBe(image);
  });
});
