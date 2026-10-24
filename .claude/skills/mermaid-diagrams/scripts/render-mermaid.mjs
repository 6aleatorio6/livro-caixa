#!/usr/bin/env node
// Desenha cada bloco ```mermaid de uma página num PNG por tema, como o site mostra: o Mermaid do
// próprio site, os temas que o Docusaurus aplica (default no claro, dark no escuro) e a coluna de
// ~800 px da página de documentação numa tela de 1440 px, onde o diagrama largo encolhe.
// Usa o Chromium da máquina (CHROME=<binário> para outro) pelo protocolo de depuração.
//
// Uso: node .claude/skills/mermaid-diagrams/scripts/render-mermaid.mjs <pasta-de-saída> <arquivo.md>...
// Gera <pasta>/<página>-L<linha>-light.png e -dark.png.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const COLUMN_WIDTH = 800;
const THEMES = [
  { name: 'light', mermaidTheme: 'default', background: '#ffffff' },
  { name: 'dark', mermaidTheme: 'dark', background: '#1b1b1d' },
];

const [outDir, ...files] = process.argv.slice(2);
if (!outDir || !files.length) {
  console.error('uso: render-mermaid.mjs <pasta-de-saída> <arquivo.md>...');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const theme = createRequire(join(ROOT, 'apps/docusaurus/package.json')).resolve('@docusaurus/theme-mermaid');
const mermaidBundle = join(dirname(createRequire(theme).resolve('mermaid')), 'mermaid.min.js');

const profile = mkdtempSync(join(tmpdir(), 'render-mermaid-'));
const chrome = spawn(process.env.CHROME ?? 'chromium-browser', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1000,800',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
]);
const browserUrl = await new Promise((done, fail) => {
  chrome.on('error', fail);
  chrome.stderr.on('data', (chunk) => {
    const match = String(chunk).match(/DevTools listening on (ws:\/\/\S+)/);
    if (match) done(match[1]);
  });
});
const port = new URL(browserUrl).port;
const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((open) => socket.addEventListener('open', open));
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const { id, result, error } = JSON.parse(data);
  pending.get(id)?.(error ? Promise.reject(new Error(error.message)) : result);
});
let lastId = 0;
const send = (method, params = {}) =>
  new Promise((reply) => {
    pending.set(++lastId, reply);
    socket.send(JSON.stringify({ id: lastId, method, params }));
  });
const evaluate = async (expression) => {
  const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
};

await evaluate(`${readFileSync(mermaidBundle, 'utf8')}\n;0`);

let errors = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const block of text.matchAll(/^[ \t]*```mermaid\b[^\n]*\n([\s\S]*?)^[ \t]*```/gm)) {
    const line = text.slice(0, block.index).split('\n').length;
    for (const { name, mermaidTheme, background } of THEMES) {
      const box = await evaluate(`(async () => {
        document.body.style.cssText = 'margin:0;background:${background}';
        mermaid.initialize({ startOnLoad: false, theme: '${mermaidTheme}' });
        try {
          const { svg } = await mermaid.render('diagram${line}', ${JSON.stringify(block[1])});
          document.body.innerHTML = '<div style="width:${COLUMN_WIDTH}px;padding:16px">' + svg + '</div>';
        } catch (error) {
          return { error: String(error.message ?? error) };
        }
        const { x, y, width, height } = document.querySelector('svg').getBoundingClientRect();
        return { x: x - 16, y: y - 16, width: width + 32, height: height + 32 };
      })()`);
      if (box.error) {
        errors++;
        console.log(`ERROR ${file}:${line}\n${box.error.replace(/^/gm, '    ')}`);
        break;
      }
      const { data } = await send('Page.captureScreenshot', {
        format: 'png', clip: { ...box, scale: 1 }, captureBeyondViewport: true,
      });
      const png = join(outDir, `${basename(file, '.md')}-L${line}-${name}.png`);
      writeFileSync(png, Buffer.from(data, 'base64'));
      console.log(png);
    }
  }
}

socket.close();
chrome.kill();
await new Promise((exit) => chrome.on('exit', exit));
rmSync(profile, { recursive: true, force: true });
process.exitCode = errors ? 1 : 0;
