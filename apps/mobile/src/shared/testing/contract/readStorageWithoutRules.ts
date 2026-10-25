import { rulesTestEnvironment } from './rulesTestEnvironment';

/** Lê os metadados de um arquivo do Storage pelo caminho, como administrador; falha se não existe. */
export async function readStorageWithoutRules(path: string) {
  const environment = await rulesTestEnvironment;
  let metadata = { contentType: '', size: 0 };
  await environment.withSecurityRulesDisabled(async (context) => {
    const found = await context.storage().ref(path).getMetadata();
    metadata = { contentType: found.contentType ?? '', size: found.size };
  });
  return metadata;
}
