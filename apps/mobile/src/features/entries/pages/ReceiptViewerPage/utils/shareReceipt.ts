import { Directory, File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

import { AppError } from '@/shared/exceptions/AppError';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';

// As extensões de cada tipo que o comprovante aceita (os de `receiptContentTypes`); a primeira é a que o nome ganha.
const EXTENSIONS_BY_CONTENT_TYPE: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/jpg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'image/heif': ['heif'],
};
const KNOWN_EXTENSIONS = new Set(Object.values(EXTENSIONS_BY_CONTENT_TYPE).flat());

/**
 * Abre o compartilhar do Android com o comprovante aberto na tela. O `expo-sharing` só compartilha um arquivo do
 * celular, então os bytes da `uri` `data:` vão antes para o cache do app, com o nome do comprovante: quem recebe vê o
 * mesmo nome. Termina quando a pessoa sai do compartilhar, tendo mandado ou não.
 */
export async function shareReceipt({
  file,
  uri,
}: {
  file: Pick<IReceiptFile, 'id' | 'name' | 'contentType'>;
  uri: string;
}) {
  try {
    // Só a última cópia fica no cache: quando a pessoa compartilha outro comprovante, o app que recebeu o anterior já
    // o leu.
    const folder = new Directory(Paths.cache, 'shared-receipts');
    if (folder.exists) folder.delete();
    folder.create({ intermediates: true });
    const copy = new File(folder, sharedNameOf(file));
    await copy.write(uri.slice(uri.indexOf(',') + 1), { encoding: 'base64' });
    await shareAsync(copy.uri, { mimeType: file.contentType, dialogTitle: 'Compartilhar comprovante' });
  } catch (error) {
    console.warn('Não deu para compartilhar o comprovante.', error);
    throw new AppError('Could not share the receipt', 'Não deu para compartilhar o comprovante.');
  }
}

/**
 * O nome da cópia, que termina na extensão do tipo: quem recebe deduz o tipo por ela. O nome vem do registro que outro
 * membro gravou, então só a última parte entra, para o arquivo não sair da pasta. Sem a extensão do tipo, ele a ganha:
 * a imagem comprimida guarda o nome original ("foto.jpg") com os bytes em WebP, e o arquivo compartilhado de outro
 * app pode vir sem extensão ("Boleto luz").
 */
function sharedNameOf({ name, contentType }: Pick<IReceiptFile, 'name' | 'contentType'>) {
  const baseName = name.split('/').at(-1) || 'comprovante';
  const extensions = EXTENSIONS_BY_CONTENT_TYPE[contentType];
  const dotIndex = baseName.lastIndexOf('.');
  const extension = dotIndex > 0 ? baseName.slice(dotIndex + 1).toLowerCase() : '';
  if (!extensions || extensions.includes(extension)) return baseName;
  // A extensão de outro tipo sai ("foto.jpg"); um ponto que não abre uma extensão fica ("Boleto 10.11").
  const stem = KNOWN_EXTENSIONS.has(extension) ? baseName.slice(0, dotIndex) : baseName;
  return `${stem}.${extensions[0]}`;
}
