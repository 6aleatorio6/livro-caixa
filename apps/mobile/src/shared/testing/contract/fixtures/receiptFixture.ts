/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const RECEIPT_PATH = resolve(__dirname, 'receipt.png');
const RECEIPT_BYTES = readFileSync(RECEIPT_PATH);

/**
 * O comprovante de verdade dos cenários: um PNG pequeno guardado ao lado, com o tamanho e os bytes que ele tem no
 * disco (também em base64). O teste de página e o contrato partem da mesma `uri`, e o conteúdo gravado pelo contrato é o dos bytes.
 * Só os testes importam este módulo.
 */
export const RECEIPT_FIXTURE = {
  uri: pathToFileURL(RECEIPT_PATH).href,
  sizeBytes: RECEIPT_BYTES.length,
  bytes: new Uint8Array(RECEIPT_BYTES),
  base64: RECEIPT_BYTES.toString('base64'),
};

/** A `uri` de um comprovante que não está mais no aparelho (o cache foi limpo): ler o arquivo falha. */
export const MISSING_RECEIPT_URI = pathToFileURL(resolve(__dirname, 'comprovante-que-sumiu.png')).href;
