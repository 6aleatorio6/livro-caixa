import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana (admin) entra na lista com Bruno e Clara; Carla entra depois.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const CLARA = 'clara.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const ELISA = 'elisa.souza@exemplo.com';
const ANA_ITEM = { email: ANA, name: 'Ana Souza', uid: testAccountUid(ANA), isAdmin: true, hasEntries: false };
const BRUNO_ITEM = { email: BRUNO, name: 'Bruno Souza', uid: testAccountUid(BRUNO), isAdmin: false, hasEntries: true };
const CLARA_ITEM = { email: CLARA, name: 'Clara Souza', uid: testAccountUid(CLARA), isAdmin: false, hasEntries: false };
const CARLA_ITEM = { email: CARLA, name: 'Carla Lima', uid: testAccountUid(CARLA), isAdmin: false, hasEntries: false };
// A Elisa ainda não entrou: o documento não tem os campos `name` nem `uid`.
const ELISA_ITEM = { email: ELISA, name: null, uid: null, isAdmin: false, hasEntries: false };

function documentOf({ email, name, uid, ...person }: IAllowedEmailListItem) {
  return { [`allowedEmails/${email}`]: { ...(name !== null && { name }), ...(uid !== null && { uid }), ...person } };
}

// Os documentos são dados fora de ordem, para provar que o serviço ordena.
const FAMILY = { ...documentOf(CLARA_ITEM), ...documentOf(ANA_ITEM), ...documentOf(BRUNO_ITEM) };

export const allowedEmailListQueryScenarios = {
  familyList: { signedInAs: ANA, given: FAMILY, input: {}, result: [ANA_ITEM, BRUNO_ITEM, CLARA_ITEM] },
  // Quem não tem nome entra na ordem pelo e-mail: a Elisa vem depois da Clara.
  familyWithPersonNotEntered: {
    signedInAs: ANA,
    given: { ...FAMILY, ...documentOf(ELISA_ITEM) },
    input: {},
    result: [ANA_ITEM, BRUNO_ITEM, CLARA_ITEM, ELISA_ITEM],
  },
  // A Ana mudou o próprio nome: a lista entrega o atual, e as telas o mostram nos lançamentos antigos.
  familyWithRenamedMember: {
    signedInAs: ANA,
    given: { ...FAMILY, ...documentOf({ ...ANA_ITEM, name: 'Ana Paula Souza' }) },
    input: {},
    result: [{ ...ANA_ITEM, name: 'Ana Paula Souza' }, BRUNO_ITEM, CLARA_ITEM],
  },
  personAddedWhileOpen: {
    signedInAs: ANA,
    given: FAMILY,
    input: {},
    result: [ANA_ITEM, BRUNO_ITEM, CLARA_ITEM],
    afterChange: { write: documentOf(CARLA_ITEM), result: [ANA_ITEM, BRUNO_ITEM, CARLA_ITEM, CLARA_ITEM] },
  },
} satisfies Record<string, IServiceScenario<object, IAllowedEmailListItem[]>>;
