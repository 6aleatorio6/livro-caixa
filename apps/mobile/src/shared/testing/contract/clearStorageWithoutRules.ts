import { CONTRACT_STORAGE_BUCKET } from './contractStorageBucket';
import { rulesTestEnvironment } from './rulesTestEnvironment';

/**
 * Apaga os objetos de `files/` do Storage, como administrador. O `clearStorage` do ambiente de teste só
 * lista a raiz do bucket e deixaria os comprovantes de um teste para o seguinte.
 */
export async function clearStorageWithoutRules() {
  const environment = await rulesTestEnvironment;
  await environment.withSecurityRulesDisabled(async (context) => {
    const { items } = await context.storage(`gs://${CONTRACT_STORAGE_BUCKET}`).ref('files').listAll();
    await Promise.all(items.map((item) => item.delete()));
  });
}
