#!/usr/bin/env node
// Passa cada bloco ```mermaid pelo parser do Mermaid do próprio site (o que o
// @docusaurus/theme-mermaid resolve), dentro do jsdom de apps/docusaurus. O build do Docusaurus não
// confere diagrama nenhum: o bloco quebrado só aparece no navegador.
//
// Uso: node .claude/skills/mermaid-diagrams/scripts/check-mermaid.mjs <arquivo-ou-pasta>...
// Sai com 1 se algum bloco não passa.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

const markdownFiles = (target) =>
  statSync(target).isFile()
    ? [target]
    : readdirSync(target, { recursive: true })
        .filter((name) => name.endsWith('.md') && !name.includes('__trash'))
        .map((name) => join(target, name));

const { JSDOM } = createRequire(join(ROOT, 'apps/docusaurus/package.json'))('jsdom');
// O DOMPurify do Mermaid lê o window global na hora do import.
globalThis.window = new JSDOM('').window;
globalThis.document = window.document;
const theme = createRequire(join(ROOT, 'apps/docusaurus/package.json')).resolve('@docusaurus/theme-mermaid');
const { default: mermaid } = await import(pathToFileURL(createRequire(theme).resolve('mermaid')).href);
mermaid.initialize({ startOnLoad: false, logLevel: 'fatal' });

let errors = 0;
for (const file of process.argv.slice(2).flatMap((target) => markdownFiles(resolve(target)))) {
  const text = readFileSync(file, 'utf8');
  for (const block of text.matchAll(/^[ \t]*```mermaid\b[^\n]*\n([\s\S]*?)^[ \t]*```/gm)) {
    const where = `${relative(process.cwd(), file)}:${text.slice(0, block.index).split('\n').length}`;
    try {
      const { diagramType } = await mermaid.parse(block[1]);
      console.log(`ok ${where} ${diagramType}`);
    } catch (error) {
      errors++;
      console.log(`ERROR ${where}\n${String(error.message ?? error).replace(/^/gm, '    ')}`);
    }
  }
}
process.exitCode = errors ? 1 : 0;
