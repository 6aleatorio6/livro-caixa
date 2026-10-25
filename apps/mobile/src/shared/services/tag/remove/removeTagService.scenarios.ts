import { HOME_TAG_ID } from '@/shared/testing/tagFixtures';
import { HEALTH_TAG_ID, HOME_TAG, THREE_TAGS_DOCUMENT } from '@/shared/testing/tagFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e as tags são da família.
const BRUNO = 'bruno.souza@exemplo.com';

export const removeTagScenarios = {
  memberRemovesTag: {
    signedInAs: BRUNO,
    given: {
      [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
      'settings/tags': THREE_TAGS_DOCUMENT,
    },
    input: [{ id: HEALTH_TAG_ID }],
    result: undefined,
  },
  // A última tag: o documento fica, com o mapa vazio, porque as regras não deixam excluí-lo.
  memberRemovesLastTag: {
    signedInAs: BRUNO,
    given: {
      [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
      'settings/tags': { items: { [HOME_TAG_ID]: HOME_TAG } },
    },
    input: [{ id: HOME_TAG_ID }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ id: string }], void>>;
