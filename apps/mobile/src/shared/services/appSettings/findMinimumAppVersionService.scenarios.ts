import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// Todos os cenários rodam sem ninguém entrar (`signedInAs: null`): é o que prova que a regra deixa qualquer um
// ler `settings/app`.
export const findMinimumAppVersionScenarios = {
  minimumVersionSet: {
    signedInAs: null,
    given: { 'settings/app': { version: '0.5.0' } },
    input: [],
    result: '0.5.0',
  },
  // O `version` vem das migrações; se alguém o gravar à mão com espaços em volta, a trava vale do mesmo jeito.
  minimumVersionWithSpaces: {
    signedInAs: null,
    given: { 'settings/app': { version: ' 0.5.0 ' } },
    input: [],
    result: '0.5.0',
  },
  blankMinimumVersion: {
    signedInAs: null,
    given: { 'settings/app': { version: '  ' } },
    input: [],
    result: null,
  },
  noAppSettings: {
    signedInAs: null,
    given: {},
    input: [],
    result: null,
  },
  // Só o campo antigo, que os apps anteriores às migrações leem: o app novo não o lê.
  legacyMinVersionOnly: {
    signedInAs: null,
    given: { 'settings/app': { minVersion: '0.5.0' } },
    input: [],
    result: null,
  },
  appSettingsWithoutVersion: {
    signedInAs: null,
    given: { 'settings/app': {} },
    input: [],
    result: null,
  },
} satisfies Record<string, IServiceScenario<[], string | null>>;
