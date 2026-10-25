// Os cenários que um fluxo pede pelo nome, pelo `data/request.js`. Cada um mexe nos dados como
// alguém de fora do app faria, inclusive com o app aberto.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { deleteDoc, doc, setDoc, Timestamp, updateDoc, type Firestore } from 'firebase/firestore';

import { ACCOUNTS, toSignInLink } from './accounts.ts';
import type { OwnerFirestore } from './firestore.ts';
import { shareFixture } from './share.ts';

/** Um comprovante de verdade: o arquivo de `data/fixtures/` que vai para o Storage com o nome que a tela mostra. */
type ReceiptFixture = { name: string; type: 'image' | 'pdf'; contentType: string };

const COMPROVANTE_LUZ: ReceiptFixture = { name: 'comprovante-luz.pdf', type: 'pdf', contentType: 'application/pdf' };
const RECIBO_CONSERTO: ReceiptFixture = { name: 'recibo-conserto.jpg', type: 'image', contentType: 'image/jpeg' };

function readFixture(name: string) {
  return readFileSync(fileURLToPath(new URL(`fixtures/${name}`, import.meta.url)));
}

/** Os parâmetros que o `data/request.js` repassa, com o nome que têm no fluxo. */
export type ScenarioParams = { EMAIL?: string; FILE?: string; COLD?: string };
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
 * quem já entrou no app; o `uid` vem do emulador do Auth (`uidOf`), então os cenários não o dão.
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
 * O uid do login da pessoa, lido do emulador do Auth pelo e-mail. O app só grava o `uid` em `allowedEmails`
 * de quem não tem nome (`useEnsureOwnName`), e as contas de teste já nascem com nome: o Firestore não o tem.
 * Quem ainda não entrou no app ganha a conta no Auth com o uid `uid-<e-mail>`, como o contrato do app
 * (`createAuthAccount`): a entrada que vem depois cai nela.
 */
async function uidOf(db: Firestore, email: string) {
  const authUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/projects/${db.app.options.projectId}`;
  // `Bearer owner` é o acesso de administrador do emulador.
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' };
  const listing = await fetch(`${authUrl}/accounts:batchGet?maxResults=100`, { headers });
  if (!listing.ok) throw new Error(`Ler as contas do emulador do Auth falhou (${listing.status}): ele está de pé?`);
  const { users = [] } = (await listing.json()) as { users?: { localId: string; email?: string }[] };
  const existing = users.find((user) => user.email === email)?.localId;
  if (existing) return existing;

  const account = Object.values(ACCOUNTS).find((candidate) => candidate.email === email);
  if (!account) throw new Error(`${email} não é uma conta de teste e não entrou no app: não há uid para ele.`);
  const uid = `uid-${email}`;
  const creation = await fetch(`${authUrl}/accounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ localId: uid, email, emailVerified: true, displayName: account.name }),
  });
  if (!creation.ok) throw new Error(`Criar a conta de ${email} no emulador do Auth falhou (${creation.status}).`);
  return uid;
}

/**
 * Grava a conta avulsa como o `addOneOffBillService`: o lançamento com a data e o resto do `writeEntryWithReceipt`.
 */
async function writeOneOffBill(
  db: Firestore,
  id: string,
  bill: { name: string; amountCents: number; date: Date; tagId?: string; paidByEmail: string },
  storedReceipt?: StoredReceipt,
) {
  const date = toDateText(bill.date);
  await writeEntryWithReceipt(
    db,
    id,
    bill.paidByEmail,
    {
      kind: 'oneOffBill',
      month: date.slice(0, 7),
      name: bill.name,
      amountCents: bill.amountCents,
      date,
      ...(bill.tagId && { tagId: bill.tagId }),
    },
    storedReceipt,
  );
}

/** Um comprovante com o objeto de verdade no Storage: o arquivo e como gravá-lo no emulador. */
type StoredReceipt = { fixture: ReceiptFixture; putObject: OwnerFirestore['putObject'] };

/**
 * Grava um lançamento como os serviços do app: o registro do comprovante, o lançamento com o `paidBy`, o
 * `createdAt` e o `receiptFileId`, e o `hasEntries` de quem pagou. Sem `storedReceipt`, o registro é de uma imagem
 * que não existe no Storage; com ele, o objeto é gravado com o autor em `customMetadata.uploadedBy`.
 */
async function writeEntryWithReceipt(
  db: Firestore,
  id: string,
  paidByEmail: string,
  entry: Record<string, unknown>,
  storedReceipt?: StoredReceipt,
) {
  const paidBy = await uidOf(db, paidByEmail);
  const fileId = `${id}-receipt`;
  const bytes = storedReceipt ? readFixture(storedReceipt.fixture.name) : null;
  if (storedReceipt && bytes) {
    await storedReceipt.putObject(`files/${fileId}`, bytes, {
      contentType: storedReceipt.fixture.contentType,
      uploadedBy: paidBy,
    });
  }
  await setDoc(doc(db, 'files', fileId), {
    name: storedReceipt?.fixture.name ?? 'comprovante.jpg',
    storagePath: `files/${fileId}`,
    type: storedReceipt?.fixture.type ?? 'image',
    contentType: storedReceipt?.fixture.contentType ?? 'image/jpeg',
    sizeBytes: bytes?.length ?? 120000,
    uploadedBy: paidBy,
  });
  await setDoc(doc(db, 'entries', id), { ...entry, paidBy, createdAt: Timestamp.now(), receiptFileId: `${id}-receipt` });
  await updateDoc(allowedEmail(db, paidByEmail), { hasEntries: true });
}

/** O último dia do mês ('AAAA-MM'). */
function lastDayOf(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

/**
 * Grava o pagamento de uma conta recorrente como o app: o id `{mês}_{conta}`, o lançamento com o dia do
 * vencimento e o previsto da conta, sem `date`, e o resto do `writeEntryWithReceipt`.
 */
async function writePayment(
  db: Firestore,
  payment: { month: string; billId: string; amountCents: number; paidByEmail: string },
  storedReceipt?: StoredReceipt,
) {
  const { month, billId, amountCents, paidByEmail } = payment;
  const bill = BILLS_IN_USE[billId as keyof typeof BILLS_IN_USE];
  await writeEntryWithReceipt(
    db,
    `${month}_${billId}`,
    paidByEmail,
    {
      kind: 'recurringPayment',
      month,
      recurringBillId: billId,
      name: bill.name,
      amountCents,
      dueDay: Math.min(bill.dayOfMonth, lastDayOf(month)),
      expectedAmountCents: bill.expectedAmountCents,
      tagId: bill.tagId,
    },
    storedReceipt,
  );
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
   * A tela Meus pagamentos do design, sobre o que o `reset` deixou: as
   * tags, duas contas avulsas dele neste mês (Conserto da geladeira no dia 12 ou hoje, o que vier antes,
   * e Farmácia hoje, sem tag), uma no mês anterior (Mercado) e uma da Ana neste mês (Padaria). Os
   * registros de `files` existem, os arquivos no Storage não (nada lê o comprovante ainda). O Bruno e a
   * Ana ficam com `hasEntries: true`; as datas saem de hoje.
   */
  async seedMyPayments({ db }) {
    const today = new Date();
    const fridgeDay = Math.min(12, today.getDate());
    await writeTags(db);
    await writeOneOffBill(db, 'fridge', {
      name: 'Conserto da geladeira',
      amountCents: 35000,
      date: new Date(today.getFullYear(), today.getMonth(), fridgeDay),
      tagId: 'casa',
      paidByEmail: ACCOUNTS.member.email,
    });
    await writeOneOffBill(db, 'pharmacy', { name: 'Farmácia', amountCents: 8735, date: today, paidByEmail: ACCOUNTS.member.email });
    await writeOneOffBill(db, 'market', {
      name: 'Mercado',
      amountCents: 15000,
      date: new Date(today.getFullYear(), today.getMonth() - 1, 15),
      paidByEmail: ACCOUNTS.member.email,
    });
    await writeOneOffBill(db, 'bakery', { name: 'Padaria', amountCents: 4200, date: today, paidByEmail: ACCOUNTS.admin.email });
  },
  /**
   * O Início do design, sobre o que o `reset` deixou, no mês atual: as tags e as cinco contas, o Aluguel
   * (R$ 1.800,00, dia 5) pago pela Ana, o Condomínio (R$ 450,00, dia 8) pelo Bruno, a Luz paga por R$ 187,35
   * (previsto R$ 210,00, dia 10) pela Ana e a avulsa Conserto da geladeira (R$ 350,00, Casa) do Bruno;
   * a Internet (dia 15) e a Água (dia 20) ficam a pagar.
   */
  async seedHome({ db }) {
    const today = new Date();
    const month = toDateText(today).slice(0, 7);
    await writeTagsAndBills(db);
    await writePayment(db, { month, billId: 'rent', amountCents: 180000, paidByEmail: ACCOUNTS.admin.email });
    await writePayment(db, { month, billId: 'condo', amountCents: 45000, paidByEmail: ACCOUNTS.member.email });
    await writePayment(db, { month, billId: 'electricity', amountCents: 18735, paidByEmail: ACCOUNTS.admin.email });
    await writeOneOffBill(db, 'fridge', {
      name: 'Conserto da geladeira',
      amountCents: 35000,
      date: new Date(today.getFullYear(), today.getMonth(), Math.min(12, today.getDate())),
      tagId: 'casa',
      paidByEmail: ACCOUNTS.member.email,
    });
  },
  /**
   * A tela de compartilhar do design: as contas do `seedHome` (a Internet e a Água ficam a pagar). O arquivo
   * `pix-agua-outubro.pdf` de `data/fixtures/` não entra no Storage: a jornada o põe no aparelho e o compartilha.
   */
  async seedShareReceipt(owner, params) {
    await scenariosByName.seedHome(owner, params);
  },
  /**
   * Compartilha com o app um arquivo de `data/fixtures/` pelo adb, como o Android faz ao escolher o Livro-Caixa
   * num outro app (`data/share.ts`). Com o app aberto, a intent chega ao app que está rodando; com `COLD=true`,
   * o app fecha antes e abre já com ela.
   */
  async shareReceipt(_owner, params) {
    shareFixture(getParam(params, 'FILE'), { cold: params.COLD === 'true' });
  },
  /**
   * Os detalhes do lançamento do design, sobre o que o `reset` deixou, no mês atual: as tags e as cinco contas, a
   * Luz paga pela Ana (R$ 187,35, previsto R$ 210,00, dia 10, Serviços) com o `comprovante-luz.pdf` de duas
   * páginas e a avulsa Conserto da geladeira do Bruno (R$ 350,00, Casa) com o `recibo-conserto.jpg`. Os objetos
   * existem de verdade no Storage, com o autor nos metadados.
   */
  async seedEntryDetails({ db, putObject }) {
    const today = new Date();
    const month = toDateText(today).slice(0, 7);
    await writeTagsAndBills(db);
    await writePayment(
      db,
      { month, billId: 'electricity', amountCents: 18735, paidByEmail: ACCOUNTS.admin.email },
      { fixture: COMPROVANTE_LUZ, putObject },
    );
    await writeOneOffBill(
      db,
      'fridge',
      {
        name: 'Conserto da geladeira',
        amountCents: 35000,
        date: new Date(today.getFullYear(), today.getMonth(), Math.min(12, today.getDate())),
        tagId: 'casa',
        paidByEmail: ACCOUNTS.member.email,
      },
      { fixture: RECIBO_CONSERTO, putObject },
    );
  },
};
