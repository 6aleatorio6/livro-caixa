import type { Bytes } from 'firebase/firestore';

import { readWithoutRules } from './readWithoutRules';

/** Os bytes do conteúdo do comprovante em `fileContents/{fileId}`, como administrador; `null` se ele não existe. */
export async function readContentWithoutRules(fileId: string) {
  const document = await readWithoutRules(`fileContents/${fileId}`);
  return document ? (document.content as Bytes).toUint8Array() : null;
}
