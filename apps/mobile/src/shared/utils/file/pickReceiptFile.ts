import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';

import type { ILocalFile } from '@/shared/types/file/LocalFile';

/** Abre o seletor de arquivos do celular (imagem ou PDF); `null` quando a pessoa cancela. Não há câmera nem galeria. */
export async function pickReceiptFile(): Promise<ILocalFile | null> {
  const result = await getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;

  const [asset] = result.assets;

  return {
    uri: asset.uri,
    name: asset.name,
    contentType: asset.mimeType ?? '',
    sizeBytes: asset.size ?? new File(asset.uri).size,
  };
}
