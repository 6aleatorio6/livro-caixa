#!/usr/bin/env node
/**
 * typecheck-index.mjs — os tipos do app inteiro, como estão no índice: o que o commit vai levar.
 *
 * Roda de dentro do app. O índice do app vai para uma pasta temporária, e o Oxlint confere ali só os tipos,
 * com uma config sem regras. Assim, o que outra sessão ainda não adicionou na mesma pasta fica de fora, e
 * o erro que a mudança causa num arquivo fora do commit (o chamador de uma assinatura alterada) aparece.
 * O `--hide-unstaged` do lint-staged daria o mesmo sem cópia, mas guardaria no stash, durante o commit, o
 * trabalho que outra sessão ainda não adicionou.
 * Num rebase não confere: os commits intermediários não precisam passar, só o resultado, que a revisão
 * da branch confere com o `tsc`.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

// O git roda da raiz: num `git commit <caminhos>`, o GIT_INDEX_FILE que ele passa ao hook vale a
// partir dela.
function git(args, input) {
  return execFileSync('git', args, { cwd: root, input, encoding: 'utf8' });
}

const isRebasing = ['rebase-merge', 'rebase-apply'].some((name) =>
  existsSync(resolve(root, git(['rev-parse', '--git-path', name]).trim())),
);
if (isRebasing) process.exit(0);

const app = relative(root, process.cwd());
const copy = mkdtempSync(join(tmpdir(), 'livro-caixa-typecheck-'));
try {
  git(['checkout-index', '-z', '--stdin', `--prefix=${copy}/`], git(['ls-files', '-z', '--', app]));
  // O `.expo` e o `expo-env.d.ts` ficam fora do índice (estão no `.gitignore`), mas o tsconfig os inclui:
  // eles trazem os tipos das rotas do expo-router. Sem eles na cópia, uma rota que não existe passaria
  // calada.
  for (const name of ['node_modules', '.expo', 'expo-env.d.ts']) {
    if (existsSync(join(root, app, name))) symlinkSync(join(root, app, name), join(copy, app, name));
  }
  // Sem regras: o `plugins: []` tira os plugins que vêm ligados, e o `correctness: 'off'`, as regras do
  // núcleo. A config do app não serve aqui, porque os JS plugins dela ficam em lint/, fora da cópia.
  const config = join(copy, 'typecheck.json');
  writeFileSync(
    config,
    JSON.stringify({ options: { typeAware: true, typeCheck: true }, categories: { correctness: 'off' }, plugins: [] }),
  );
  const oxlint = join(root, app, 'node_modules/.bin/oxlint');
  // O `--ignore-pattern` deixa o link do node_modules de fora sem depender do `.gitignore` da cópia: sem
  // ele, o tsgolint confere o node_modules inteiro (minutos e gigabytes de memória, em vez de segundos).
  const { status, signal, error } = spawnSync(
    oxlint,
    ['--disable-nested-config', '--ignore-pattern=node_modules', '-c', config, '--threads=4', '.'],
    // Quatro threads, como o lint do lint-staged: nenhum commit deve tomar todos os núcleos. O GOMAXPROCS
    // limita o tsgolint, que é em Go.
    { cwd: join(copy, app), stdio: 'inherit', env: { ...process.env, GOMAXPROCS: process.env.GOMAXPROCS ?? '4' } },
  );
  // Sem a mensagem, um Oxlint que não rodou ou caiu por sinal pareceria um erro de tipo a caçar no código.
  if (error) console.error(`typecheck-index: o Oxlint não rodou (não é erro de tipo): ${error.message}`);
  else if (signal) console.error(`typecheck-index: o Oxlint caiu pelo sinal ${signal} (não é erro de tipo).`);
  process.exitCode = status ?? 1;
} finally {
  // O rmSync apaga o link do node_modules sem entrar nele.
  rmSync(copy, { recursive: true, force: true });
}
