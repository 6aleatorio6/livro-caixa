// O `pnpm backup [pasta]`: copia tudo o que o app guarda no Firebase para um arquivo cifrado, por padrão em
// `backups/` (fora do Git): todas as coleções do Firestore, com os bytes dos comprovantes, e as contas do
// Authentication, cujos uids `uploadedBy` e `allowedEmails.uid` referenciam. Usa a conta do `firebase login`
// (`firebase-rest.mjs`). O plano gratuito não tem o export gerenciado do Firestore (ele precisa do Cloud Storage), por
// isso a cópia vem pela API REST, documento a documento.
//
// O Firestore é lido num instante só (`readTime`): um lote gravado durante o backup entra inteiro ou não entra. Como o
// Firestore só lê até 1 h atrás, o backup precisa terminar nesse prazo.
//
// A cifra é do `gpg --symmetric` (AES-256), com a frase que o gpg pede na hora: o texto claro nunca vai para o disco,
// cada linha segue direto para a entrada do gpg. Para ler: `gpg --decrypt <arquivo>.ndjson.gpg > backup.ndjson`.
//
// Cada linha do NDJSON é um objeto, e o `kind` diz qual:
// - `header`: o projeto, se veio do emulador, o `readTime` e as coleções;
// - `document`: o caminho (`entries/<id>`), os campos no formato da API REST do Firestore, que guarda o tipo de cada
//   valor (bytes em base64, datas, números inteiros), e o `createTime`/`updateTime`;
// - `authUser`: uma conta, como o `downloadAccount` do Authentication a devolve;
// - `footer`: quantos documentos de cada coleção e quantas contas. Um arquivo sem ele ficou pela metade.
//
// Com `FIRESTORE_EMULATOR_HOST` e `FIREBASE_AUTH_EMULATOR_HOST` definidos, copia os emuladores.
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { documentPath, firestoreBase, listDocuments, PROJECT_ID, request, usingEmulator } from './firebase-rest.mjs';

if (usingEmulator !== Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST)) {
  console.error('Defina FIRESTORE_EMULATOR_HOST e FIREBASE_AUTH_EMULATOR_HOST juntos: o backup copia os dois.');
  process.exit(1);
}

// O mesmo endereço do `firebase auth:export`; o emulador o atende sob o host original.
const downloadAccountUrl = `${
  usingEmulator ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/www.googleapis.com` : 'https://www.googleapis.com'
}/identitytoolkit/v3/relyingparty/downloadAccount`;

// Uns segundos no passado, para um relógio local um pouco adiantado não pedir um instante que o servidor ainda não viu.
const readTime = new Date(Date.now() - 10_000).toISOString();

async function listCollectionIds() {
  const ids = [];
  let pageToken;
  do {
    const page = await request(`${firestoreBase}:listCollectionIds`, {
      method: 'POST',
      body: JSON.stringify({ pageSize: 100, pageToken, readTime }),
    });
    ids.push(...(page.collectionIds ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return ids.sort();
}

async function* documentRecords(collectionId) {
  // Um documento de `fileContents` chega a 1,2 MB em base64: páginas de 10 para a resposta ficar em ~12 MB.
  const pageSize = collectionId === 'fileContents' ? 10 : 300;
  for await (const document of listDocuments(collectionId, { pageSize, readTime })) {
    yield {
      kind: 'document',
      path: documentPath(document.name),
      fields: document.fields ?? {},
      createTime: document.createTime,
      updateTime: document.updateTime,
    };
  }
}

async function* authUserRecords() {
  let nextPageToken;
  do {
    const page = await request(downloadAccountUrl, {
      method: 'POST',
      body: JSON.stringify({ targetProjectId: PROJECT_ID, maxResults: 1000, nextPageToken }),
    });
    for (const user of page.users ?? []) yield { kind: 'authUser', user };
    nextPageToken = page.users?.length ? page.nextPageToken : undefined;
  } while (nextPageToken);
}

// O terminal de onde o script foi chamado: o pinentry de terminal pergunta a frase no `GPG_TTY`, e com a entrada do gpg
// num pipe ele não o descobre sozinho. Sem terminal (ou com o pinentry gráfico), fica sem.
function callerTerminal() {
  try {
    return execFileSync('tty', { stdio: ['inherit', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  } catch {
    return undefined;
  }
}

// O pnpm repassa um `--` ao script, e roda o script na raiz: a pasta relativa vale a partir de onde ele foi chamado.
const [folderArg] = process.argv.slice(2).filter((arg) => arg !== '--');
const outputDir = folderArg
  ? resolve(process.env.INIT_CWD ?? process.cwd(), folderArg)
  : join(dirname(fileURLToPath(import.meta.url)), '..', 'backups');
const outputPath = join(outputDir, `${PROJECT_ID}-${readTime.replace(/\.\d+Z$/, 'Z').replaceAll(':', '-')}.ndjson.gpg`);
mkdirSync(outputDir, { recursive: true });

const gpg = spawn('gpg', ['--symmetric', '--cipher-algo', 'AES256', '--no-symkey-cache', '--output', outputPath], {
  stdio: ['pipe', 'inherit', 'inherit'],
  env: { ...process.env, GPG_TTY: process.env.GPG_TTY || callerTerminal() },
});
// `{ code }` quando o gpg fecha, `{ error }` quando ele nem abre (não instalado).
let gpgEnd;
const gpgExit = new Promise((resolveExit) => {
  gpg.on('error', (error) => resolveExit((gpgEnd ??= { error })));
  gpg.on('close', (code) => resolveExit((gpgEnd ??= { code })));
});
const gpgFailure = () => gpgEnd.error ?? new Error(`o gpg saiu com o código ${gpgEnd.code}`);
// O EPIPE de um gpg que fechou antes do fim (a frase cancelada): o motivo vem do `gpgEnd`.
gpg.stdin.on('error', () => {});

async function emit(record) {
  if (gpgEnd) throw gpgFailure();
  if (!gpg.stdin.write(`${JSON.stringify(record)}\n`)) {
    await Promise.race([once(gpg.stdin, 'drain').catch(() => {}), gpgExit]);
  }
}

const documents = {};
let authUsers = 0;
try {
  const collections = await listCollectionIds();
  await emit({ kind: 'header', format: 1, project: PROJECT_ID, emulator: usingEmulator, readTime, collections });
  for (const collectionId of collections) {
    documents[collectionId] = 0;
    for await (const record of documentRecords(collectionId)) {
      await emit(record);
      documents[collectionId] += 1;
    }
  }
  for await (const record of authUserRecords()) {
    await emit(record);
    authUsers += 1;
  }
  await emit({ kind: 'footer', documents, authUsers });
  gpg.stdin.end();
  await gpgExit;
  if (gpgEnd.error || gpgEnd.code !== 0) throw gpgFailure();
} catch (error) {
  gpg.kill();
  await gpgExit;
  rmSync(outputPath, { force: true });
  console.error(`Backup não feito: ${error.message}`);
  process.exit(1);
}

// O resumo só no fim: durante a cópia, o pinentry de terminal pode estar na tela.
for (const [collectionId, count] of Object.entries(documents)) console.log(`${collectionId}: ${count} documento(s)`);
console.log(`Authentication: ${authUsers} conta(s)`);
console.log(`\nBackup cifrado em ${outputPath} (${(statSync(outputPath).size / 1024 / 1024).toFixed(2)} MiB)`);
