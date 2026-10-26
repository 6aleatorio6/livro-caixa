import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';

import type { ILocalFile } from '@/shared/types/file/LocalFile';

import { RECEIPT_IMAGE_CONTENT_TYPES } from './receiptContentTypes';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { RECEIPT_MAX_DIMENSION } from './receiptMaxDimension';

/**
 * A escada da redução, em ordem: primeiro baixa a qualidade, que pouco muda a leitura, e só depois o lado maior. O piso
 * (1600 px, 0,5) ainda deixa legível o texto de uma nota ou de um boleto; abaixo dele, a imagem é recusada.
 */
const REDUCTION_STEPS = [
  { maxDimension: RECEIPT_MAX_DIMENSION, qualities: [0.82, 0.7, 0.6, 0.5] },
  { maxDimension: 2048, qualities: [0.6, 0.5] },
  { maxDimension: 1600, qualities: [0.5] },
];

// GIF fica de fora: a redução guardaria só o primeiro quadro.
const REDUCIBLE_CONTENT_TYPES = RECEIPT_IMAGE_CONTENT_TYPES.filter((contentType) => contentType !== 'image/gif');

/**
 * Devolve a imagem que cabe no comprovante: a original até 900 KiB, senão o primeiro degrau da escada que cabe, em WebP.
 * Quando nem o piso cabe, ou reduzir não dá certo, devolve a original, e o `prepareReceipt` a recusa pelo tamanho.
 */
export async function reduceImage(image: ILocalFile): Promise<ILocalFile> {
  if (image.sizeBytes <= RECEIPT_MAX_BYTES || !REDUCIBLE_CONTENT_TYPES.includes(image.contentType)) {
    return image;
  }

  try {
    // Abrir a imagem já no limite evita decodificar a foto inteira: a de 48 MP ocupa quase 200 MB na memória.
    const decoded = await ImageManipulator.manipulate(image.uri, {
      maxWidth: RECEIPT_MAX_DIMENSION,
      maxHeight: RECEIPT_MAX_DIMENSION,
    }).renderAsync();

    for (const { maxDimension, qualities } of REDUCTION_STEPS) {
      const resized = await resizedTo(decoded, maxDimension);
      for (const quality of qualities) {
        const reduced = await resized.saveAsync({ compress: quality, format: SaveFormat.WEBP });
        // O tamanho vem 0 ou null quando o arquivo salvo não pode ser lido.
        const reducedSizeBytes = new File(reduced.uri).size;
        if (reducedSizeBytes && reducedSizeBytes <= RECEIPT_MAX_BYTES) {
          // O arquivo reduzido é WebP, mas a pessoa reconhece o nome que escolheu.
          return { uri: reduced.uri, name: image.name, contentType: 'image/webp', sizeBytes: reducedSizeBytes };
        }
      }
    }
    return image;
  } catch {
    return image;
  }
}

// A imagem com o lado maior em `maxDimension`, sem aumentar a que já é menor; o `resize` mantém a proporção.
async function resizedTo(image: ImageRef, maxDimension: number) {
  if (Math.max(image.width, image.height) <= maxDimension) return image;
  const size = image.width >= image.height ? { width: maxDimension } : { height: maxDimension };
  return ImageManipulator.manipulate(image).resize(size).renderAsync();
}
