import { describe } from 'node:test';

import { setDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, itEach, recurringBillOf, rowsFor, signedInAs } from './setup.mjs';

// A conta nova nasce com o id `water`: `internet` já existe, e gravar sobre ela seria um update.
const WATER = { name: 'Água', expectedAmountCents: 8000, dayOfMonth: 10, startsOn: '2026-01-01' };

/** A conta válida com os campos trocados em `changes` e sem os de `omit`. */
function waterWith(changes = {}, omit = []) {
  const data = { ...WATER, ...changes };
  for (const field of omit) delete data[field];
  return data;
}

describe('recurringBills create by profile', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'create a recurring bill without a tag', true, { data: waterWith() }),
    ...rowsFor(MEMBERS, 'create a recurring bill with a tag', true, { data: waterWith({ tagId: 't1' }) }),
    ...rowsFor(OUTSIDERS, 'create a recurring bill', false, { data: waterWith() }),
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, setDoc(recurringBillOf(as(), 'water'), data)));
});

// Em cada linha, `data` é o documento que o membro (Bruno) tenta criar.
describe('recurringBills create by a member', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member create a recurring bill with a name of 60 characters', data: waterWith({ name: 'a'.repeat(60) }), isAllowed: true },
    { title: 'Should let a member create a recurring bill on day 1', data: waterWith({ dayOfMonth: 1 }), isAllowed: true },
    { title: 'Should let a member create a recurring bill on day 31', data: waterWith({ dayOfMonth: 31 }), isAllowed: true },
    { title: 'Should not let a member create a recurring bill without a name', data: waterWith({}, ['name']), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a name of only spaces', data: waterWith({ name: '   ' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a name of 61 characters', data: waterWith({ name: 'a'.repeat(61) }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a name that is a number', data: waterWith({ name: 42 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill without expectedAmountCents', data: waterWith({}, ['expectedAmountCents']), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with expectedAmountCents zero', data: waterWith({ expectedAmountCents: 0 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a negative expectedAmountCents', data: waterWith({ expectedAmountCents: -100 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a fractional expectedAmountCents', data: waterWith({ expectedAmountCents: 1.5 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with expectedAmountCents as a text', data: waterWith({ expectedAmountCents: '8000' }), isAllowed: false },
    { title: 'Should let a member create a recurring bill with expectedAmountCents at the field limit', data: waterWith({ expectedAmountCents: 999999999 }), isAllowed: true },
    { title: 'Should not let a member create a recurring bill with expectedAmountCents above the field limit', data: waterWith({ expectedAmountCents: 1000000000 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill without dayOfMonth', data: waterWith({}, ['dayOfMonth']), isAllowed: false },
    { title: 'Should not let a member create a recurring bill on day 0', data: waterWith({ dayOfMonth: 0 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill on day 32', data: waterWith({ dayOfMonth: 32 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a fractional dayOfMonth', data: waterWith({ dayOfMonth: 1.5 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with dayOfMonth as a text', data: waterWith({ dayOfMonth: '10' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill without startsOn', data: waterWith({}, ['startsOn']), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with an empty startsOn', data: waterWith({ startsOn: '' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with startsOn as dd/mm/yyyy', data: waterWith({ startsOn: '01/01/2026' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with startsOn without zero padding', data: waterWith({ startsOn: '2026-1-1' }), isAllowed: false },
    { title: 'Should let a member create a recurring bill with startsOn on the last day of the year', data: waterWith({ startsOn: '2026-12-31' }), isAllowed: true },
    { title: 'Should not let a member create a recurring bill with startsOn in month 13', data: waterWith({ startsOn: '2026-13-01' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with startsOn in month 00', data: waterWith({ startsOn: '2026-00-10' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with startsOn on day 00', data: waterWith({ startsOn: '2026-01-00' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with startsOn on day 32', data: waterWith({ startsOn: '2026-01-32' }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a tagId that is a number', data: waterWith({ tagId: 42 }), isAllowed: false },
    { title: 'Should not let a member create a recurring bill with a key besides the five', data: waterWith({ paidBy: 'ana@gmail.com' }), isAllowed: false },
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, setDoc(recurringBillOf(bruno(), 'water'), data)));
});
