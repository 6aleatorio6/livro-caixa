// O init: o que `pnpm migrate:init` grava num banco que ainda não tem `version`. Não tem versão própria e não entra na
// lista das migrações. Grava `version: "0.0.0"`, que não trava nenhum app, e não mexe em mais nada: os dados como estão
// são o ponto de partida da primeira migração.
import { documentName } from '../../scripts/firebase-rest.mjs';

/** A versão que o init grava, e a que a primeira migração espera encontrar. */
export const INIT_VERSION = '0.0.0';

export default async function init() {
  return [
    {
      update: { name: documentName('settings/app'), fields: { version: { stringValue: INIT_VERSION } } },
      // Só o campo `version`: o `minVersion` que o documento já tem fica como está.
      updateMask: { fieldPaths: ['version'] },
    },
  ];
}
