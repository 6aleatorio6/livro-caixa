/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { uploadBytes, type SettableMetadata, type StorageReference } from 'firebase/storage';

export * from 'firebase/storage';

/**
 * No teste de contrato, substitui `@react-native-firebase/storage` (`jest.contract.config.mjs`). O
 * `putFile` do RNFB envia o arquivo de um caminho do aparelho e não tem equivalente no SDK
 * JavaScript: aqui o arquivo é lido do disco (`file://…`) e enviado com `uploadBytes`. Ele prova as regras
 * e o lote, não o envio nativo, que só o aparelho prova (a jornada do comprovante).
 */
export function putFile(storageRef: StorageReference, fileUri: string, metadata?: SettableMetadata) {
  return uploadBytes(storageRef, readFileSync(fileURLToPath(fileUri)), metadata);
}
