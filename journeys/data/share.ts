// O compartilhamento de um arquivo com o app, pelo adb: o que o Android faz quando a pessoa escolhe o Livro-Caixa
// no "Compartilhar" de outro app. O servidor de dados roda neste container, que tem o adb; o Maestro, não.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = 'dev.leonardolf.livrocaixa';
const DOWNLOADS = '/sdcard/Download';
const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

function adb(...args: string[]) {
  const result = spawnSync('adb', args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`adb ${args.join(' ')} falhou: ${result.stderr || result.stdout}`);
  return result.stdout;
}

/** O `_id` que a MediaStore deu ao arquivo: o scanner demora um instante depois do broadcast. */
function findDownloadId(fileName: string) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const rows = adb('shell', 'content', 'query', '--uri', 'content://media/external/downloads', '--projection', '_id:_display_name');
    for (const row of rows.split('\n')) {
      const match = /_id=(\d+), _display_name=(.*)$/.exec(row.trim());
      if (match && match[2] === fileName) return match[1];
    }
    spawnSync('sleep', ['0.5']);
  }
  throw new Error(`A MediaStore não listou ${fileName} em Downloads.`);
}

/**
 * Põe o arquivo de `data/fixtures/` em Downloads, deixa a MediaStore conhecê-lo e abre o app com um SEND para
 * ele. O endereço vai também em `-d`: só assim o `am` concede a leitura ao app (`--grant-read-uri-permission`
 * só vale para o que está no `data` ou no `ClipData`, e o `am` não monta o `ClipData` do `EXTRA_STREAM`); sem
 * isso o app recebe a intent e falha com "has no access to content://…".
 */
export function shareFixture(fileName: string, { cold }: { cold: boolean }) {
  const contentType = CONTENT_TYPES[fileName.split('.').pop()?.toLowerCase() ?? ''];
  if (!contentType) throw new Error(`Sem tipo conhecido para ${fileName}.`);
  adb('push', fileURLToPath(new URL(`fixtures/${fileName}`, import.meta.url)), `${DOWNLOADS}/${fileName}`);
  adb('shell', 'am', 'broadcast', '-a', 'android.intent.action.MEDIA_SCANNER_SCAN_FILE', '-d', `file://${DOWNLOADS}/${fileName}`);
  const uri = `content://media/external/downloads/${findDownloadId(fileName)}`;
  if (cold) adb('shell', 'am', 'force-stop', APP);
  adb(
    'shell', 'am', 'start', '-a', 'android.intent.action.SEND', '-t', contentType, '-d', uri,
    '--eu', 'android.intent.extra.STREAM', uri, '--grant-read-uri-permission', '-n', `${APP}/.MainActivity`,
  );
}
