// Os cenários que um fluxo pede pelo nome, pelo `data/request.js`. Cada um mexe nos dados como
// alguém de fora do app faria, inclusive com o app aberto.
import { deleteDoc, doc, getDoc, setDoc, Timestamp, updateDoc, type Firestore } from 'firebase/firestore';

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

async function writeTags(db: Firestore) {
  await setDoc(doc(db, 'settings', 'tags'), { items: TAGS });
}

/** Grava as três tags e as cinco contas recorrentes, como o app as grava. */
async function writeTagsAndBills(db: Firestore) {
  await writeTags(db);
  for (const [id, bill] of Object.entries(BILLS_IN_USE)) {
    await setDoc(doc(db, 'recurringBills', id), bill);
  }
}

/** 'AAAA-MM-DD' pelos campos locais, como o app grava a data. */
function toDateText(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * O uid que o app gravou na primeira entrada da pessoa; os lançamentos o citam em `paidBy`. Sem ele a
 * pessoa ainda não entrou no app, e o cenário não tem como inventá-lo.
 */
async function uidOf(db: Firestore, email: string) {
  const person = await getDoc(allowedEmail(db, email));
  const uid = person.data()?.uid;
  if (typeof uid !== 'string') throw new Error(`${email} ainda não entrou no app: entre com a conta antes deste cenário.`);
  return uid;
}

/** Grava a conta avulsa e o registro do comprovante (sem arquivo no Storage), como o `addOneOffBillService`. */
async function writeOneOffBill(
  db: Firestore,
  id: string,
  bill: { name: string; amountCents: number; date: Date; tagId?: string; paidBy: string },
) {
  const date = toDateText(bill.date);
  await setDoc(doc(db, 'files', `${id}-receipt`), {
    storagePath: `files/${id}-receipt`,
    type: 'image',
    contentType: 'image/jpeg',
    sizeBytes: 120000,
    uploadedBy: bill.paidBy,
  });
  await setDoc(doc(db, 'entries', id), {
    kind: 'oneOffBill',
    month: date.slice(0, 7),
    name: bill.name,
    amountCents: bill.amountCents,
    date,
    ...(bill.tagId && { tagId: bill.tagId }),
    paidBy: bill.paidBy,
    createdAt: Timestamp.now(),
    receiptFileId: `${id}-receipt`,
  });
}

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
  seedTags: ({ db }) => writeTagsAndBills(db),
  /**
   * As cinco contas recorrentes da tela de contas (Aluguel, Condomínio, Luz, Internet e Água) com as três
   * tags: os mesmos dados do `seedTags`, que já são os do design.
   */
  seedRecurringBills: ({ db }) => writeTagsAndBills(db),
  /**
   * A tela Meus pagamentos do design, sobre o que o `reset` deixou e depois da entrada do Bruno no app: as
   * tags, duas contas avulsas dele neste mês (Conserto da geladeira no dia 12 ou hoje, o que vier antes,
   * e Farmácia hoje, sem tag), uma no mês anterior (Mercado) e uma da Ana neste mês (Padaria). Os
   * registros de `files` existem, os arquivos no Storage não (nada lê o comprovante ainda). O Bruno e a
   * Ana ficam com `hasEntries: true`; as datas saem de hoje.
   */
  async seedMyPayments({ db }) {
    const today = new Date();
    const brunoUid = await uidOf(db, ACCOUNTS.member.email);
    // A Ana pode não ter entrado: o `paidBy` dela só precisa ser diferente do Bruno.
    const anaUid = (await getDoc(allowedEmail(db, ACCOUNTS.admin.email))).data()?.uid ?? 'uid-ana';
    const fridgeDay = Math.min(12, today.getDate());
    await writeTags(db);
    await writeOneOffBill(db, 'fridge', {
      name: 'Conserto da geladeira',
      amountCents: 35000,
      date: new Date(today.getFullYear(), today.getMonth(), fridgeDay),
      tagId: 'casa',
      paidBy: brunoUid,
    });
    await writeOneOffBill(db, 'pharmacy', { name: 'Farmácia', amountCents: 8735, date: today, paidBy: brunoUid });
    await writeOneOffBill(db, 'market', {
      name: 'Mercado',
      amountCents: 15000,
      date: new Date(today.getFullYear(), today.getMonth() - 1, 15),
      paidBy: brunoUid,
    });
    await writeOneOffBill(db, 'bakery', { name: 'Padaria', amountCents: 4200, date: today, paidBy: anaUid });
    await updateDoc(allowedEmail(db, ACCOUNTS.member.email), { hasEntries: true });
    await updateDoc(allowedEmail(db, ACCOUNTS.admin.email), { hasEntries: true });
  },
};
