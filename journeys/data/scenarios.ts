// Os cenários que um fluxo pede pelo nome, pelo `data/request.js`. Cada um mexe nos dados como
// alguém de fora do app faria, inclusive com o app aberto.
import { deleteDoc, doc, setDoc, updateDoc, type Firestore } from 'firebase/firestore';

import { ACCOUNTS, toSignInLink } from './accounts.ts';
import type { OwnerFirestore } from './firestore.ts';

/** Os parâmetros que o `data/request.js` repassa, com o nome que têm no fluxo. */
export type ScenarioParams = { EMAIL?: string };
type Scenario = (owner: OwnerFirestore, params: ScenarioParams) => Promise<object | void>;

function getParam(params: ScenarioParams, name: keyof ScenarioParams) {
  const value = params[name];
  if (!value) throw new Error(`Falta o parâmetro ${name}.`);
  return value;
}

function allowedEmail(db: Firestore, email: string) {
  return doc(db, 'allowedEmails', email);
}

/**
 * Põe a pessoa na lista como o `addAllowedEmailService` do app: sem lançamentos. O nome só entra para
 * quem já entrou no app; o `uid` o app grava na primeira entrada, então os cenários não o dão.
 */
function addPerson(db: Firestore, email: string, { name, isAdmin = false }: { name?: string; isAdmin?: boolean } = {}) {
  const nameField = name === undefined ? {} : { name };
  return setDoc(allowedEmail(db, email), { ...nameField, isAdmin, hasEntries: false });
}

/** Quem a tela de e-mails permitidos mostra no design: a Elisa ainda não entrou, então não tem nome. */
const CLARA = { email: 'clara.souza@exemplo.com', name: 'Clara Souza' };
const ELISA = { email: 'elisa.souza@exemplo.com' };

/**
 * As três tags do design, com os ids que as contas recorrentes citam em `tagId` (os mesmos de
 * `shared/testing/tagFixtures.ts` do app): Casa em madeira, Serviços em azul e Saúde em ameixa.
 */
const TAGS = {
  casa: { name: 'Casa', nameKey: 'casa', color: 'wood' },
  servicos: { name: 'Serviços', nameKey: 'servicos', color: 'blue' },
  saude: { name: 'Saúde', nameKey: 'saude', color: 'plum' },
};

/**
 * As contas recorrentes que põem a Casa em uso por 2 (Aluguel e Condomínio) e os Serviços por 3 (Luz,
 * Internet e Água), como o cenário `fiveBills` do `recurringBillListQueryService` do app; a Saúde fica
 * sem uso. Os documentos são como o `addRecurringBillService` grava.
 */
const BILLS_IN_USE = {
  rent: { name: 'Aluguel', expectedAmountCents: 180000, dayOfMonth: 5, startsOn: '2026-01-01', tagId: 'casa' },
  condo: { name: 'Condomínio', expectedAmountCents: 45000, dayOfMonth: 8, startsOn: '2026-01-01', tagId: 'casa' },
  electricity: { name: 'Luz', expectedAmountCents: 21000, dayOfMonth: 10, startsOn: '2026-01-01', tagId: 'servicos' },
  internet: { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01', tagId: 'servicos' },
  water: { name: 'Água', expectedAmountCents: 9800, dayOfMonth: 20, startsOn: '2026-01-01', tagId: 'servicos' },
};

export const scenariosByName: Record<string, Scenario> = {
  /** O começo de cada fluxo: o Firestore apagado e a lista de e-mails com as contas liberadas. */
  async reset({ db, deleteAll }) {
    await deleteAll();
    for (const { email, name, isAllowed, isAdmin } of Object.values(ACCOUNTS)) {
      if (isAllowed) await addPerson(db, email, { name, isAdmin });
    }
    const accounts = Object.fromEntries(
      Object.entries(ACCOUNTS).map(([profile, account]) => [profile, { ...account, signInLink: toSignInLink(account) }]),
    );
    return { accounts };
  },
  /**
   * A lista do design da tela de e-mails permitidos, sobre o que o `reset` deixou: a Ana (admin), o Bruno
   * (agora com lançamentos), a Clara (sem lançamentos) e a Elisa (sem nome).
   */
  async seedAllowedEmails({ db }) {
    await updateDoc(allowedEmail(db, ACCOUNTS.member.email), { hasEntries: true });
    await addPerson(db, CLARA.email, { name: CLARA.name });
    await addPerson(db, ELISA.email);
  },
  /** Põe o `EMAIL` na lista como o admin faria: sem nome (ele vem da conta Google), sem a marca de admin. */
  allowEmail: ({ db }, params) => addPerson(db, getParam(params, 'EMAIL')),
  removeEmail: ({ db }, params) => deleteDoc(allowedEmail(db, getParam(params, 'EMAIL'))),
  /** Tira só a marca de admin: o nome e o resto do documento ficam. */
  removeAdmin: ({ db }, params) => updateDoc(allowedEmail(db, getParam(params, 'EMAIL')), { isAdmin: false }),
  /**
   * As tags do design (Casa, Serviços e Saúde) sobre o que o `reset` deixou, com as contas recorrentes que
   * deixam a Casa em uso por 2 contas e os Serviços por 3; a Saúde não tem uso e pode ser excluída.
   */
  async seedTags({ db }) {
    await setDoc(doc(db, 'settings', 'tags'), { items: TAGS });
    for (const [id, bill] of Object.entries(BILLS_IN_USE)) {
      await setDoc(doc(db, 'recurringBills', id), bill);
    }
  },
};
