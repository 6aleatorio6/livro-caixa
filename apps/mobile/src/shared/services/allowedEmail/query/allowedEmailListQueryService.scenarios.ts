import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana (admin) entra na lista com Bruno e Clara; Carla entra depois.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const CLARA = 'clara.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const ANA_ITEM = { email: ANA, name: 'Ana Souza', isAdmin: true, hasEntries: false };
const BRUNO_ITEM = { email: BRUNO, name: 'Bruno Souza', isAdmin: false, hasEntries: true };
const CLARA_ITEM = { email: CLARA, name: 'Clara Souza', isAdmin: false, hasEntries: false };
const CARLA_ITEM = { email: CARLA, name: 'Carla Lima', isAdmin: false, hasEntries: false };

function documentOf({ email, ...person }: IAllowedEmailListItem) {
  return { [`allowedEmails/${email}`]: person };
}

// Os documentos são dados fora de ordem, para provar que o serviço ordena.
const FAMILY = { ...documentOf(CLARA_ITEM), ...documentOf(ANA_ITEM), ...documentOf(BRUNO_ITEM) };

export const allowedEmailListQueryScenarios = {
  familyList: { signedInAs: ANA, given: FAMILY, input: {}, result: [ANA_ITEM, BRUNO_ITEM, CLARA_ITEM] },
  personAddedWhileOpen: {
    signedInAs: ANA,
    given: FAMILY,
    input: {},
    result: [ANA_ITEM, BRUNO_ITEM, CLARA_ITEM],
    afterChange: { write: documentOf(CARLA_ITEM), result: [ANA_ITEM, BRUNO_ITEM, CARLA_ITEM, CLARA_ITEM] },
  },
} satisfies Record<string, IServiceScenario<object, IAllowedEmailListItem[]>>;
