/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { CONTRACT_STORAGE_BUCKET } from './contractStorageBucket';
import { RECEIPT_FIXTURE } from './fixtures/receiptFixture';
import { rulesTestEnvironment } from './rulesTestEnvironment';

/**
 * Grava no Storage, como administrador, um objeto por caminho: o comprovante PNG dos contratos com o tipo
 * e o `customMetadata.uploadedBy` que o cenário diz, como o envio do app o deixaria.
 */
export async function writeStorageWithoutRules(
  objects: Record<string, { contentType: string; uploadedBy: string }>,
) {
  if (Object.keys(objects).length === 0) return;
  const environment = await rulesTestEnvironment;
  const bytes = readFileSync(fileURLToPath(RECEIPT_FIXTURE.uri));
  await environment.withSecurityRulesDisabled(async (context) => {
    const storage = context.storage(`gs://${CONTRACT_STORAGE_BUCKET}`);
    await Promise.all(
      Object.entries(objects).map(([path, { contentType, uploadedBy }]) =>
        storage.ref(path).put(bytes, { contentType, customMetadata: { uploadedBy } }),
      ),
    );
  });
}
