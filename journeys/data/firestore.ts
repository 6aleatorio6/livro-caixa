// O Firestore e o Storage do emulador como dono do projeto, pela mesma biblioteca do `firebase/rules-tests/`:
// o `withSecurityRulesDisabled` passa por cima das regras, como quem administra pelo console.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { Firestore } from 'firebase/firestore';

// O `clearData` do emulador avisa cada escuta de que ela saiu do ar. Se o cliente fechou a chamada na mesma
// hora (o app derruba a conexão ao primeiro erro de uma escuta, e a tela de tags tem três), o aviso seguinte
// vai para uma chamada cancelada, e o emulador responde 500 com o código 499, "call already cancelled",
// embora o app não faça parte do pedido. Apagar de novo não custa nada: o que a primeira vez apagou fica
// apagado, e a escuta fechada já não está na lista. O aviso evita que a repetição passe em silêncio.
const CLEAR_ATTEMPTS = 3;

async function clearWithRetry(clear: () => Promise<void>, warn: (message: string) => void) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await clear();
    } catch (error) {
      const isCancelledCall = String(error).includes('call already cancelled');
      if (!isCancelledCall || attempt === CLEAR_ATTEMPTS) throw error;
      warn(
        `O emulador falhou ao apagar o Firestore (escuta já cancelada); tentativa ${attempt + 1} de ${CLEAR_ATTEMPTS}.`,
      );
    }
  }
}

/** Um objeto do Storage como o envio do app o deixa: o tipo e o autor em `customMetadata.uploadedBy`. */
export type StorageObject = { contentType: string; uploadedBy: string };

/** O que um cenário recebe: o banco, já sem as regras, como apagá-lo inteiro (com o Storage) e como gravar um objeto. */
export type OwnerFirestore = {
  db: Firestore;
  deleteAll: () => Promise<void>;
  putObject: (path: string, bytes: Uint8Array, metadata: StorageObject) => Promise<void>;
};

export type EmulatorPorts = { firestore: number; storage: number };

/**
 * `bucket` é o do app (`storage_bucket` do `google-services.json`). `warn` recebe os avisos do banco (hoje, o
 * apagar repetido): o `test.ts` os junta no resumo da rodada.
 */
export async function openEmulatorFirestore(
  projectId: string,
  ports: EmulatorPorts,
  bucket: string,
  warn: (message: string) => void,
) {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: 'localhost', port: ports.firestore },
    storage: { host: 'localhost', port: ports.storage },
  });
  return {
    async asOwner<Result>(write: (owner: OwnerFirestore) => Promise<Result>) {
      let result: Result | undefined;
      await environment.withSecurityRulesDisabled(async (context) => {
        // A biblioteca devolve o tipo do SDK antigo (compat); as funções modulares aceitam o mesmo objeto.
        const db = context.firestore() as unknown as Firestore;
        result = await write({
          db,
          deleteAll: async () => {
            await clearWithRetry(() => environment.clearFirestore(), warn);
            // O `clearStorage` do ambiente só lista a raiz do bucket, e os comprovantes ficam planos em `files/`.
            const { items } = await context.storage(`gs://${bucket}`).ref('files').listAll();
            await Promise.all(items.map((item) => item.delete()));
            await environment.clearStorage();
          },
          async putObject(path, bytes, { contentType, uploadedBy }) {
            await context.storage(`gs://${bucket}`).ref(path).put(bytes, { contentType, customMetadata: { uploadedBy } });
          },
        });
      });
      return result as Result;
    },
    close: () => environment.cleanup(),
  };
}
