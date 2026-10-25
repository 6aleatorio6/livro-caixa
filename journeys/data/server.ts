// O servidor dos dados de teste. O `runScript` do Maestro roda num motor próprio, sem Node e sem
// `import`, e só fala HTTP para fora do fluxo: por aqui, um passo pede um cenário pelo nome
// (`data/request.js`), e a lógica fica em TypeScript. O `test.ts` o liga durante a rodada.
import { once } from 'node:events';
import { createServer } from 'node:http';
import { text } from 'node:stream/consumers';

import { openEmulatorFirestore, type EmulatorPorts } from './firestore.ts';
import { scenariosByName } from './scenarios.ts';

type DataServerOptions = { port: number; firebaseProject: string; ports: EmulatorPorts; storageBucket: string };

export async function startDataServer({ port, firebaseProject, ports, storageBucket }: DataServerOptions) {
  // Os avisos da rodada (um apagar repetido, um cenário que falhou): vão para o log na hora e voltam em
  // `warnings`, para o resumo da rodada não deixar uma repetição passar em silêncio.
  const warnings: string[] = [];
  const warn = (message: string) => {
    warnings.push(message);
    console.warn(message);
  };
  const firestore = await openEmulatorFirestore(firebaseProject, ports, storageBucket, warn);
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
      const message = error instanceof Error ? error.message : String(error);
      warn(`O cenário "${name}" falhou: ${message}`);
      response.writeHead(500).end(message);
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
    warnings,
    close: async () => {
      server.close();
      await firestore.close();
    },
  };
}
