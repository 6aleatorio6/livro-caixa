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
};
