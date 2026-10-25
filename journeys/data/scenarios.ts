// Os cenários que um fluxo pede pelo nome, pelo `data/request.js`. Cada um mexe nos dados como
// alguém de fora do app faria, inclusive com o app aberto.
import { deleteDoc, doc, setDoc, updateDoc, type Firestore } from 'firebase/firestore';

import { ACCOUNTS, toSignInLink } from './accounts.ts';
import type { OwnerFirestore } from './firestore.ts';

/** Os parâmetros que o `data/request.js` repassa, com o nome que têm no fluxo. */
export type ScenarioParams = { EMAIL?: string; NAME?: string };
type Scenario = (owner: OwnerFirestore, params: ScenarioParams) => Promise<object | void>;

function getParam(params: ScenarioParams, name: keyof ScenarioParams) {
  const value = params[name];
  if (!value) throw new Error(`Falta o parâmetro ${name}.`);
  return value;
}

function allowedEmail(db: Firestore, email: string) {
  return doc(db, 'allowedEmails', email);
}

/** Libera o e-mail como o admin faria pela tela: com o nome e, para quem chega, sem lançamentos. */
function writeAllowedEmail(db: Firestore, email: string, name: string, isAdmin: boolean) {
  return setDoc(allowedEmail(db, email), { name, isAdmin, hasEntries: false });
}

export const scenariosByName: Record<string, Scenario> = {
  /** O começo de cada fluxo: o Firestore apagado e a lista de e-mails com as contas liberadas. */
  async reset({ db, deleteAll }) {
    await deleteAll();
    for (const account of Object.values(ACCOUNTS)) {
      if (account.isAllowed) await writeAllowedEmail(db, account.email, account.name, account.isAdmin);
    }
    const accounts = Object.fromEntries(
      Object.entries(ACCOUNTS).map(([profile, account]) => [profile, { ...account, signInLink: toSignInLink(account) }]),
    );
    return { accounts };
  },
  /** Põe o `EMAIL` na lista com o `NAME`, sem a marca de admin. */
  allowEmail: ({ db }, params) => writeAllowedEmail(db, getParam(params, 'EMAIL'), getParam(params, 'NAME'), false),
  removeEmail: ({ db }, params) => deleteDoc(allowedEmail(db, getParam(params, 'EMAIL'))),
  /** Tira só a marca de admin: o nome e o resto do documento ficam. */
  removeAdmin: ({ db }, params) => updateDoc(allowedEmail(db, getParam(params, 'EMAIL')), { isAdmin: false }),
};
