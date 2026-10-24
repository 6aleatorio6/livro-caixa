// @ts-check
import path from 'node:path';

import { COMPILE_ERRORS_LOG, createErrorLogFile } from './error-log-file.mjs';

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @returns {import('@docusaurus/types').Plugin}
 */
export default function compileErrorsPlugin({ siteDir }) {
  const errorLog = createErrorLogFile(path.join(siteDir, COMPILE_ERRORS_LOG));
  return {
    name: 'compile-errors',
    configureWebpack(_config, isServer) {
      return { plugins: [errorLog.webpackPlugin(isServer ? 'server' : 'client')] };
    },
  };
}
