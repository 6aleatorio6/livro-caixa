import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { ILocalFile } from '@/shared/types/file/LocalFile';

export const IMAGE_REDUCTION_MIN_BYTES = 2 * 1024 * 1024;
const IMAGE_REDUCTION_MAX_DIMENSION = 2560;
const IMAGE_REDUCTION_QUALITY = 0.82;

// GIF fica de fora: a redução guardaria só o primeiro quadro.
const REDUCIBLE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Devolve a imagem original sempre que reduzir não valer a pena ou não der certo. */
export async function reduceImage(image: ILocalFile): Promise<ILocalFile> {
  if (image.sizeBytes <= IMAGE_REDUCTION_MIN_BYTES || !REDUCIBLE_CONTENT_TYPES.includes(image.contentType)) {
    return image;
  }

  try {
    // Abrir a imagem já no limite evita decodificar a foto inteira: a de 48 MP ocupa quase 200 MB na memória.
    const decoded = await ImageManipulator.manipulate(image.uri, {
      maxWidth: IMAGE_REDUCTION_MAX_DIMENSION,
      maxHeight: IMAGE_REDUCTION_MAX_DIMENSION,
    }).renderAsync();
    const reduced = await decoded.saveAsync({ compress: IMAGE_REDUCTION_QUALITY, format: SaveFormat.WEBP });
    // O tamanho vem 0 ou null quando o arquivo salvo não pode ser lido.
    const reducedSizeBytes = new File(reduced.uri).size;
    if (!reducedSizeBytes || reducedSizeBytes >= image.sizeBytes) return image;

    return { uri: reduced.uri, contentType: 'image/webp', sizeBytes: reducedSizeBytes };
  } catch {
    return image;
  }
}
