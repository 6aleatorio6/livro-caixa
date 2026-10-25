/// <reference types="node" />

import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RECEIPT_PATH = resolve(__dirname, 'receipt.png');

/**
 * O comprovante de verdade dos cenários: um PNG pequeno guardado ao lado, com o tamanho que ele tem no
 * disco. O teste de página e o contrato partem da mesma `uri`, e o Storage do contrato recebe os bytes dela.
 * Só os testes importam este módulo.
 */
export const RECEIPT_FIXTURE = { uri: pathToFileURL(RECEIPT_PATH).href, sizeBytes: statSync(RECEIPT_PATH).size };
