/// <reference types="node" />

import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * No teste de contrato, substitui o `File` do `expo-file-system` (`jest.contract.config.mjs`), que lê pelo módulo
 * nativo: aqui o arquivo é lido do disco (`file://…`). Só o que os serviços usam existe.
 */
export class File {
  constructor(private readonly uri: string) {}

  get size() {
    return statSync(fileURLToPath(this.uri)).size;
  }

  async base64() {
    return (await readFile(fileURLToPath(this.uri))).toString('base64');
  }
}
