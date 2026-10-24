import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

const ANA = 'ana.souza@exemplo.com';
const CLARA = 'clara.souza@exemplo.com';

export const removeAllowedEmailScenarios = {
  adminRemovesClara: {
    signedInAs: ANA,
    given: {
      [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: false },
      [`allowedEmails/${CLARA}`]: { name: 'Clara Souza', isAdmin: false, hasEntries: false },
    },
    input: [{ email: CLARA }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ email: string }], void>>;
