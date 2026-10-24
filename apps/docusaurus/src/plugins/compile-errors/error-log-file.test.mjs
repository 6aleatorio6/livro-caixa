// @ts-check
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { createErrorLogFile, formatCompileErrors, formatCompiling, isCompiling } from './error-log-file.mjs';

/** @typedef {import('./error-log-file.mjs').CompileError} CompileError */

function fakeCompiler() {
  /** @type {(() => void) | undefined} */
  let onCompile;
  /** @type {((stats: import('./error-log-file.mjs').CompilationStats) => void) | undefined} */
  let onDone;
  return {
    hooks: {
      compile: {
        /** @param {string} _name @param {() => void} fn */
        tap: (_name, fn) => void (onCompile = fn),
      },
      done: {
        /** @param {object} _options @param {NonNullable<typeof onDone>} fn */
        tap: (_options, fn) => void (onDone = fn),
      },
    },
    start() {
      onCompile?.();
    },
    /** @param {CompileError[]} errors */
    finish(errors) {
      onDone?.({ hasErrors: () => errors.length > 0, toJson: () => ({ errors }) });
    },
  };
}

function logFileInTempDir() {
  return path.join(mkdtempSync(path.join(os.tmpdir(), 'compile-errors-')), 'compile-errors.log');
}

/** @type {CompileError} */
const mdxError = {
  moduleName: '../../docs/guia.mdx',
  loc: '12:1-12:8',
  message: 'Unexpected closing slash `/` in tag',
};

test('Should format a header with the compiler, the count and the time, and each error with file, position and message', () => {
  const text = formatCompileErrors('client', [mdxError], new Date('2026-09-15T10:00:00Z'));

  assert.equal(
    text,
    '[client] 1 erro — 2026-09-15T10:00:00.000Z\n\n../../docs/guia.mdx 12:1-12:8\nUnexpected closing slash `/` in tag\n',
  );
});

test('Should print only the message of an error without a module, and count the errors in the plural', () => {
  const text = formatCompileErrors('server', [{ message: 'a' }, { message: 'b' }], new Date(0));

  assert.match(text, /^\[server\] 2 erros — /);
  assert.match(text, /\n\na\n\nb\n$/);
});

test('Should mark the compiler as compiling, with the time', () => {
  assert.equal(formatCompiling('client', new Date('2026-09-15T10:00:00Z')), '[client] compilando — 2026-09-15T10:00:00.000Z\n');
});

test('Should recognize the compiling mark that formatCompiling writes, and not the errors', () => {
  assert.equal(isCompiling(formatCompileErrors('client', [mdxError]) + '\n' + formatCompiling('server')), true);
  assert.equal(isCompiling(formatCompileErrors('client', [mdxError])), false);
});

test('Should create the file with the compiler marked as compiling when a compilation starts', () => {
  const filePath = logFileInTempDir();
  const compiler = fakeCompiler();
  createErrorLogFile(filePath).webpackPlugin('client').apply(compiler);

  compiler.start();

  assert.match(readFileSync(filePath, 'utf8'), /^\[client\] compilando — /);
});

test('Should replace the compiling mark with the errors when the compilation fails', () => {
  const filePath = logFileInTempDir();
  const compiler = fakeCompiler();
  createErrorLogFile(filePath).webpackPlugin('client').apply(compiler);

  compiler.start();
  compiler.finish([mdxError]);

  const text = readFileSync(filePath, 'utf8');
  assert.match(text, /\[client\] 1 erro/);
  assert.match(text, /docs\/guia\.mdx/);
  assert.doesNotMatch(text, /compilando/);
});

test('Should delete the file when a compilation passes after one that failed', () => {
  const filePath = logFileInTempDir();
  const compiler = fakeCompiler();
  createErrorLogFile(filePath).webpackPlugin('client').apply(compiler);

  compiler.start();
  compiler.finish([mdxError]);
  compiler.start();
  compiler.finish([]);

  assert.equal(existsSync(filePath), false);
});

test('Should not fail when a compilation passes with no file left from before', () => {
  const filePath = logFileInTempDir();
  const compiler = fakeCompiler();
  createErrorLogFile(filePath).webpackPlugin('client').apply(compiler);

  compiler.start();
  compiler.finish([]);

  assert.equal(existsSync(filePath), false);
});

test('Should keep the errors of each of two compilers, and delete the file only when both pass', () => {
  const filePath = logFileInTempDir();
  const log = createErrorLogFile(filePath);
  const client = fakeCompiler();
  const server = fakeCompiler();
  log.webpackPlugin('client').apply(client);
  log.webpackPlugin('server').apply(server);

  client.start();
  server.start();
  assert.match(readFileSync(filePath, 'utf8'), /\[client\] compilando[\s\S]*\[server\] compilando/);

  client.finish([mdxError]);
  server.finish([{ message: 'só no server' }]);
  assert.match(readFileSync(filePath, 'utf8'), /\[client\] 1 erro[\s\S]*\[server\] 1 erro[\s\S]*só no server/);

  client.start();
  client.finish([]);
  assert.doesNotMatch(readFileSync(filePath, 'utf8'), /\[client\]/);
  assert.match(readFileSync(filePath, 'utf8'), /\[server\]/);

  server.start();
  server.finish([]);
  assert.equal(existsSync(filePath), false);
});
