// Os arquivos de `data/fixtures/`: o conteúdo que um cenário grava em `fileContents` e o arquivo que o
// `shareFixture` põe no aparelho.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export function fixturePath(fileName: string) {
  return fileURLToPath(new URL(`fixtures/${fileName}`, import.meta.url));
}

export function readFixture(fileName: string) {
  return readFileSync(fixturePath(fileName));
}

/** O tipo de um arquivo de `data/fixtures/`, pela extensão. */
export function contentTypeOf(fileName: string) {
  const contentType = CONTENT_TYPES[fileName.split('.').pop()?.toLowerCase() ?? ''];
  if (!contentType) throw new Error(`Sem tipo conhecido para ${fileName}.`);
  return contentType;
}
