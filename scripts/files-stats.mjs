// Temporário: um retrato da coleção `files` (quantidade, total, mediana, por tipo e por faixa de tamanho), gravado em
// `docs/local/files-stats.log`, fora do Git. Lê só `sizeBytes`, `type` e `contentType` de cada registro: nunca o nome,
// o `uploadedBy`, o id nem os bytes de `fileContents`, que só é contada. Usa a conta do `firebase login`
// (`firebase-rest.mjs`); com `FIRESTORE_EMULATOR_HOST` definido, lê o emulador.
//
// Uso: node scripts/files-stats.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { firestoreBase, listDocuments, PROJECT_ID, request, usingEmulator } from './firebase-rest.mjs';

// O `RECEIPT_MAX_BYTES` do app (`receiptMaxBytes.ts`): importar o `.ts` daqui faz o Node avisar a cada execução.
const RECEIPT_MAX_BYTES = 900 * 1024;
const KIB = 1024;
const MIB = 1024 * 1024;
const LOG_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'local', 'files-stats.log');

async function listFiles() {
  const files = [];
  for await (const document of listDocuments('files', { fields: ['sizeBytes', 'type', 'contentType'] })) {
    const fields = document.fields ?? {};
    const size = fields.sizeBytes?.integerValue ?? fields.sizeBytes?.doubleValue;
    files.push({
      sizeBytes: size === undefined ? null : Number(size),
      type: fields.type?.stringValue ?? '(sem type)',
      contentType: fields.contentType?.stringValue ?? '(sem contentType)',
    });
  }
  return files;
}

// Conta os documentos de uma coleção no servidor, sem baixar nenhum.
async function countCollection(collectionId) {
  const [result] = await request(`${firestoreBase}:runAggregationQuery`, {
    method: 'POST',
    body: JSON.stringify({
      structuredAggregationQuery: {
        structuredQuery: { from: [{ collectionId }] },
        aggregations: [{ alias: 'total', count: {} }],
      },
    }),
  });
  return Number(result.result.aggregateFields.total.integerValue);
}

function percentile(sorted, fraction) {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

const kib = (bytes) => `${(bytes / KIB).toFixed(1)} KiB`;
const mib = (bytes) => `${(bytes / MIB).toFixed(2)} MiB`;

function summarize(label, sizes) {
  const sorted = [...sizes].sort((a, b) => a - b);
  const total = sorted.reduce((sum, size) => sum + size, 0);
  const indent = `${label.match(/^ */)[0]}  `;
  return [
    `${label}: ${sorted.length} arquivo(s), total ${mib(total)} (${total} bytes)`,
    `${indent}mediana ${kib(percentile(sorted, 0.5))} · média ${kib(sorted.length ? total / sorted.length : 0)}`,
    `${indent}mín ${kib(sorted[0] ?? 0)} · p90 ${kib(percentile(sorted, 0.9))} · máx ${kib(sorted.at(-1) ?? 0)}`,
  ];
}

const groupBy = (items, key) =>
  [...Map.groupBy(items, (item) => item[key])].sort(([a], [b]) => a.localeCompare(b));

const files = await listFiles();
const fileContentsCount = await countCollection('fileContents');
const sized = files.filter((file) => file.sizeBytes !== null);

const buckets = [
  [0, 100 * KIB],
  [100 * KIB, 250 * KIB],
  [250 * KIB, 500 * KIB],
  [500 * KIB, 750 * KIB],
  [750 * KIB, 850 * KIB],
  [850 * KIB, RECEIPT_MAX_BYTES + 1],
];
const bucketLabel = ([from, to]) => `${Math.round(from / KIB)}–${Math.round(Math.min(to, RECEIPT_MAX_BYTES) / KIB)} KiB`;
const aboveLimit = sized.filter((file) => file.sizeBytes > RECEIPT_MAX_BYTES).length;

const lines = [
  `Retrato da coleção files — ${new Date().toISOString()}`,
  `Projeto: ${PROJECT_ID}${usingEmulator ? ' (emulador)' : ''}`,
  '',
  `Registros em files: ${files.length} · documentos em fileContents: ${fileContentsCount}` +
    (files.length === fileContentsCount ? '' : ` (fileContents − files = ${fileContentsCount - files.length})`),
  `Registros sem sizeBytes: ${files.length - sized.length}`,
  '',
  ...summarize('Geral', sized.map((file) => file.sizeBytes)),
  '',
  'Por type:',
  ...groupBy(sized, 'type').flatMap(([type, group]) => summarize(`  ${type}`, group.map((file) => file.sizeBytes))),
  '',
  'Por contentType:',
  ...groupBy(files, 'contentType').map(([contentType, group]) => `  ${contentType}: ${group.length}`),
  '',
  `Por faixa de tamanho (limite ${kib(RECEIPT_MAX_BYTES)}):`,
  ...buckets.map((bucket) => {
    const count = sized.filter((file) => file.sizeBytes >= bucket[0] && file.sizeBytes < bucket[1]).length;
    return `  ${bucketLabel(bucket).padEnd(14)} ${String(count).padStart(5)}`;
  }),
  `  acima do limite ${String(aboveLimit).padStart(5)}`,
];

mkdirSync(dirname(LOG_PATH), { recursive: true });
writeFileSync(LOG_PATH, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
console.log(`\nLog gravado em ${LOG_PATH}`);
