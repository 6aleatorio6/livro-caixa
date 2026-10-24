// @ts-check
import { rmSync, writeFileSync } from 'node:fs';

/**
 * @typedef {object} CompileError
 * @property {string} message
 * @property {string} [moduleName]
 * @property {string} [loc]
 */

/**
 * @typedef {object} CompilationStats
 * @property {() => boolean} hasErrors
 * @property {(preset: 'errors-warnings') => { errors?: CompileError[] }} toJson
 */

/**
 * @typedef {object} CompilerHooks
 * @property {{
 *   compile: { tap(pluginName: string, onCompile: () => void): void };
 *   done: { tap(options: { name: string; stage: number }, onDone: (stats: CompilationStats) => void): void };
 * }} hooks
 */

/** O arquivo, na pasta do site, que o script de espera também lê. */
export const COMPILE_ERRORS_LOG = 'compile-errors.log';

const PLUGIN_NAME = 'compile-errors';
// No `build`, o ForceTerminatePlugin do Docusaurus encerra o processo no próprio tap do `done`
// quando o client falha; o `stage` negativo faz o tapable chamar este antes dele.
const DONE_TAP = { name: PLUGIN_NAME, stage: -1 };

/**
 * @param {string} compilerName
 * @param {Date} [at]
 */
export function formatCompiling(compilerName, at = new Date()) {
  return `[${compilerName}] compilando — ${at.toISOString()}\n`;
}

/** Algum compilador ainda está na seção que o `formatCompiling` escreve? */
export function isCompiling(/** @type {string} */ logText) {
  return /^\[\w+\] compilando — /m.test(logText);
}

/**
 * @param {string} compilerName
 * @param {CompileError[]} errors
 * @param {Date} [at]
 */
export function formatCompileErrors(compilerName, errors, at = new Date()) {
  const count = errors.length === 1 ? '1 erro' : `${errors.length} erros`;
  const header = `[${compilerName}] ${count} — ${at.toISOString()}`;
  const entries = errors.map(({ moduleName, loc, message }) => {
    const location = [moduleName, loc].filter(Boolean).join(' ');
    return location ? `${location}\n${message}` : message;
  });
  return `${[header, ...entries].join('\n\n')}\n`;
}

/** @param {string} filePath */
export function createErrorLogFile(filePath) {
  /** @type {Map<string, string>} */
  const sectionByCompiler = new Map();

  function rewrite() {
    if (sectionByCompiler.size === 0) {
      rmSync(filePath, { force: true });
      return;
    }
    writeFileSync(filePath, [...sectionByCompiler.values()].join('\n'));
  }

  return {
    /** @param {string} compilerName */
    webpackPlugin(compilerName) {
      return {
        /** @param {CompilerHooks} compiler */
        apply(compiler) {
          compiler.hooks.compile.tap(PLUGIN_NAME, () => {
            sectionByCompiler.set(compilerName, formatCompiling(compilerName));
            rewrite();
          });
          compiler.hooks.done.tap(DONE_TAP, (stats) => {
            if (stats.hasErrors()) {
              const errors = stats.toJson('errors-warnings').errors ?? [];
              sectionByCompiler.set(compilerName, formatCompileErrors(compilerName, errors));
            } else {
              sectionByCompiler.delete(compilerName);
            }
            rewrite();
          });
        },
      };
    },
  };
}
