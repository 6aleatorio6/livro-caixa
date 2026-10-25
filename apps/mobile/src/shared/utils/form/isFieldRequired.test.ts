import { array, mixed, number, object, string } from 'yup';

import { isFieldRequired } from './isFieldRequired';

const schema = object({
  name: string().required(),
  note: string(),
  amountCents: number().min(1, 'Informe o valor.'),
  tagId: string().test('picked', 'Escolha a tag.', (value) => Boolean(value)),
  installments: array(object({ dueDate: string().required(), note: string() })),
  kind: mixed<'recurring' | 'oneOff'>().oneOf(['recurring', 'oneOff']).required(),
  recurrence: object().when('kind', {
    is: 'recurring',
    then: () => object({ dayOfMonth: number().required(), startsOn: string() }),
  }),
});

const values = {
  name: '',
  note: '',
  amountCents: undefined,
  tagId: '',
  installments: [{ dueDate: '', note: '' }],
  kind: 'recurring',
  recurrence: { dayOfMonth: undefined, startsOn: '' },
};

describe('isFieldRequired', () => {
  it('Should treat a required field as required', () => {
    expect(isFieldRequired(schema, values, 'name')).toBe(true);
  });

  it('Should treat a field without any rule as optional', () => {
    expect(isFieldRequired(schema, values, 'note')).toBe(false);
  });

  it('Should treat as required any rule that refuses the empty value, whatever its name', () => {
    expect(isFieldRequired(schema, values, 'tagId')).toBe(true);
  });

  it('Should treat a minimum alone as optional, because an empty number is not checked', () => {
    expect(isFieldRequired(schema, values, 'amountCents')).toBe(false);
  });

  it('Should answer for a field inside a list row', () => {
    expect(isFieldRequired(schema, values, 'installments.0.dueDate')).toBe(true);
    expect(isFieldRequired(schema, values, 'installments.0.note')).toBe(false);
  });

  it('Should resolve a when() with the current values, inside nested objects', () => {
    expect(isFieldRequired(schema, values, 'recurrence.dayOfMonth')).toBe(true);
    expect(isFieldRequired(schema, values, 'recurrence.startsOn')).toBe(false);
    expect(isFieldRequired(schema, { ...values, kind: 'oneOff' }, 'recurrence.dayOfMonth')).toBe(false);
  });

  it('Should treat a path the schema does not have as optional', () => {
    expect(isFieldRequired(schema, values, 'missing.field')).toBe(false);
  });
});
