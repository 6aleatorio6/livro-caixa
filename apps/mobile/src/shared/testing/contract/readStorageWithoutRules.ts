import { CONTRACT_STORAGE_BUCKET } from './contractStorageBucket';
import { rulesTestEnvironment } from './rulesTestEnvironment';

/**
 * Lê os metadados (tipo, tamanho e `customMetadata`) de um arquivo do Storage pelo caminho, como administrador; falha se não existe. O
 * bucket é o do app dos contratos (`contractApp`), não o `gs://<projeto>` que o ambiente de teste usa.
 */
export async function readStorageWithoutRules(path: string) {
  const environment = await rulesTestEnvironment;
  let metadata = { contentType: '', size: 0, customMetadata: {} as Record<string, string> };
  await environment.withSecurityRulesDisabled(async (context) => {
    const found = await context.storage(`gs://${CONTRACT_STORAGE_BUCKET}`).ref(path).getMetadata();
    metadata = { contentType: found.contentType ?? '', size: found.size, customMetadata: found.customMetadata ?? {} };
  });
  return metadata;
}
