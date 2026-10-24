import { object, string } from 'yup';

import { requiredFieldNames } from './required-field-names';

describe('requiredFieldNames', () => {
  it('Should list the fields the schema requires and leave the optional ones out', () => {
    const schema = object({
      name: string().required(),
      tag: string().optional(),
      date: string().required(),
    });

    expect([...requiredFieldNames(schema)].sort()).toEqual(['date', 'name']);
  });
});
