import { describe } from 'node:test';

import { deleteField, setDoc, updateDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, SEEDED_BILL, assertAccess, itEach, recurringBillOf, rowsFor, signedInAs } from './setup.mjs';

// `internet` já existe (semeada com tagId `t1`), então `setDoc` sobre ela é um update.

/** A conta semeada com os campos trocados em `changes` e sem os de `omit`. */
function internetWith(changes = {}, omit = []) {
  const data = { ...SEEDED_BILL, ...changes };
  for (const field of omit) delete data[field];
  return data;
}

describe('recurringBills update by profile', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'change the amount of a recurring bill', true, { data: { expectedAmountCents: 12990 } }),
    ...rowsFor(MEMBERS, 'remove the tag of a recurring bill', true, { data: { tagId: deleteField() } }),
    ...rowsFor(OUTSIDERS, 'change the amount of a recurring bill', false, { data: { expectedAmountCents: 12990 } }),
    ...rowsFor(OUTSIDERS, 'remove the tag of a recurring bill', false, { data: { tagId: deleteField() } }),
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, updateDoc(recurringBillOf(as(), 'internet'), data)));
});

// Em cada linha, `data` é o documento inteiro que o membro (Bruno) grava no lugar da conta.
describe('recurringBills update by a member replacing the document', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member replace a recurring bill with a valid one without a tag', data: internetWith({ expectedAmountCents: 12990 }, ['tagId']), isAllowed: true },
    { title: 'Should let a member replace a recurring bill with a name of 60 characters', data: internetWith({ name: 'a'.repeat(60) }), isAllowed: true },
    { title: 'Should not let a member replace a recurring bill without a name', data: internetWith({}, ['name']), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a name of only spaces', data: internetWith({ name: '   ' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a name of 61 characters', data: internetWith({ name: 'a'.repeat(61) }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a name that is a number', data: internetWith({ name: 42 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill without expectedAmountCents', data: internetWith({}, ['expectedAmountCents']), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with expectedAmountCents zero', data: internetWith({ expectedAmountCents: 0 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a negative expectedAmountCents', data: internetWith({ expectedAmountCents: -100 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a fractional expectedAmountCents', data: internetWith({ expectedAmountCents: 1.5 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with expectedAmountCents as a text', data: internetWith({ expectedAmountCents: '11990' }), isAllowed: false },
    { title: 'Should let a member replace a recurring bill with expectedAmountCents at the field limit', data: internetWith({ expectedAmountCents: 999999999 }), isAllowed: true },
    { title: 'Should not let a member replace a recurring bill with expectedAmountCents above the field limit', data: internetWith({ expectedAmountCents: 1000000000 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill without dayOfMonth', data: internetWith({}, ['dayOfMonth']), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with dayOfMonth 0', data: internetWith({ dayOfMonth: 0 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with dayOfMonth 32', data: internetWith({ dayOfMonth: 32 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a fractional dayOfMonth', data: internetWith({ dayOfMonth: 1.5 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with dayOfMonth as a text', data: internetWith({ dayOfMonth: '15' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill without startsOn', data: internetWith({}, ['startsOn']), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with an empty startsOn', data: internetWith({ startsOn: '' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with startsOn as dd/mm/yyyy', data: internetWith({ startsOn: '01/01/2026' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with startsOn without zero padding', data: internetWith({ startsOn: '2026-1-1' }), isAllowed: false },
    { title: 'Should let a member replace a recurring bill with startsOn on the last day of the year', data: internetWith({ startsOn: '2026-12-31' }), isAllowed: true },
    { title: 'Should not let a member replace a recurring bill with startsOn in month 13', data: internetWith({ startsOn: '2026-13-01' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with startsOn in month 00', data: internetWith({ startsOn: '2026-00-10' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with startsOn on day 00', data: internetWith({ startsOn: '2026-01-00' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with startsOn on day 32', data: internetWith({ startsOn: '2026-01-32' }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a tagId that is a number', data: internetWith({ tagId: 42 }), isAllowed: false },
    { title: 'Should not let a member replace a recurring bill with a key besides the five', data: internetWith({ paidBy: 'ana@gmail.com' }), isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, setDoc(recurringBillOf(bruno(), 'internet'), data)));
});

// Em cada linha, `data` são só os campos que o membro (Bruno) muda; o resto da conta fica como está.
describe('recurringBills update by a member changing some fields', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member change only the name', data: { name: 'Internet fibra' }, isAllowed: true },
    { title: 'Should let a member change only the day of the month', data: { dayOfMonth: 20 }, isAllowed: true },
    { title: 'Should not let a member change the name to only spaces', data: { name: '   ' }, isAllowed: false },
    { title: 'Should not let a member change the name to 61 characters', data: { name: 'a'.repeat(61) }, isAllowed: false },
    { title: 'Should not let a member change expectedAmountCents to zero', data: { expectedAmountCents: 0 }, isAllowed: false },
    { title: 'Should not let a member change expectedAmountCents to a fractional one', data: { expectedAmountCents: 1.5 }, isAllowed: false },
    { title: 'Should not let a member change dayOfMonth to 32', data: { dayOfMonth: 32 }, isAllowed: false },
    { title: 'Should not let a member change startsOn to dd/mm/yyyy', data: { startsOn: '01/01/2026' }, isAllowed: false },
    { title: 'Should not let a member change the tagId to a number', data: { tagId: 42 }, isAllowed: false },
    { title: 'Should not let a member remove a required field', data: { dayOfMonth: deleteField() }, isAllowed: false },
    { title: 'Should not let a member add a key besides the five', data: { paidBy: 'ana@gmail.com' }, isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, updateDoc(recurringBillOf(bruno(), 'internet'), data)));
});
