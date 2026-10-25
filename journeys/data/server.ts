// O servidor dos dados de teste. O `runScript` do Maestro roda num motor próprio, sem Node e sem
// `import`, e só fala HTTP para fora do fluxo: por aqui, um passo pede um cenário pelo nome
// (`data/request.js`), e a lógica fica em TypeScript. O `test.ts` o liga durante a rodada.
import { once } from 'node:events';
import { createServer } from 'node:http';
import { text } from 'node:stream/consumers';

import { openEmulatorFirestore } from './firestore.ts';
import { scenariosByName } from './scenarios.ts';

type DataServerOptions = { port: number; firebaseProject: string; firestorePort: number };

export async function startDataServer({ port, firebaseProject, firestorePort }: DataServerOptions) {
  const firestore = await openEmulatorFirestore(firebaseProject, firestorePort);
  const server = createServer(async (request, response) => {
    const name = (request.url ?? '/').slice(1);
    const scenario = Object.hasOwn(scenariosByName, name) ? scenariosByName[name] : undefined;
    if (request.method !== 'POST' || !scenario) {
      const names = Object.keys(scenariosByName).join(', ');
      response.writeHead(404).end(`Cenário desconhecido: "${name}". Os que existem: ${names}.`);
      return;
    }
    try {
      const body = await text(request);
      const result = await firestore.asOwner((owner) => scenario(owner, body ? JSON.parse(body) : {}));
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(result ?? {}));
    } catch (error) {
      response.writeHead(500).end(error instanceof Error ? error.message : String(error));
    }
  });

  server.listen(port, '127.0.0.1');
  try {
    await once(server, 'listening');
  } catch (error) {
    await firestore.close();
    throw new Error(`O servidor de dados não subiu na ${port}: outra rodada está no ar? (${error})`);
  }
  return {
    close: async () => {
      server.close();
      await firestore.close();
    },
  };
}
