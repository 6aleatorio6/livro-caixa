// O que o pre-commit roda nos arquivos do app. A conferência de tipos é do app inteiro, uma vez por commit
// (a função não recebe a lista de arquivos), e só dispara para o que muda tipos. A mesma lista está no
// ramo do .githooks/pre-commit para o commit que só apaga arquivos.
export default {
  '*.{js,mjs,cjs,ts,mts,tsx}': [
    'oxfmt --no-error-on-unmatched-pattern',
    'oxlint --quiet --threads=4 --no-error-on-unmatched-pattern',
  ],
  '{*.{ts,tsx,mts},package.json,tsconfig.json}': () => 'node ../../scripts/typecheck-index.mjs',
};
