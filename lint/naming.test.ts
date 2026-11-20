import { describe, it } from 'node:test';
import { RuleTester } from 'oxlint/plugins-dev';
import namingPlugin from './naming.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('type-prefix', namingPlugin.rules['type-prefix'], {
  valid: [
    { name: 'Should accept an interface with the I prefix', code: `interface IProps { a: string }`, filename: 'a.ts' },
    { name: 'Should accept a type alias with the I prefix', code: `type IValues = { a: string };`, filename: 'a.ts' },
    { name: 'Should accept T alone and T followed by PascalCase as type parameters', code: `function pick<TValues, T>(values: TValues, t: T) {}`, filename: 'a.ts' },
    { name: 'Should accept type parameters of a class and of a type alias', code: `class Box<TItem> {}\ntype IList<TItem> = TItem[];`, filename: 'a.ts' },
    { name: 'Should accept a library augmentation that repeats the library name', code: `declare module 'lib' {\n  export interface LibThemes extends IAppThemes {}\n}`, filename: 'a.ts' },
    // O `infer` não é um parâmetro declarado entre `<…>`.
    { name: 'Should accept infer, which is not a declared type parameter', code: `type IElement<TList> = TList extends Array<infer U> ? U : never;`, filename: 'a.ts' },
  ],
  invalid: [
    {
      name: 'Should report an interface without the I prefix',
      code: `interface Foo { a: string }`,
      filename: 'a.ts',
      errors: [{ message: '"Foo": interface e tipo levam o prefixo I, seguido de PascalCase — "IFoo".' }],
    },
    {
      name: 'Should report a type alias without the I prefix',
      code: `type Bar = { a: string };`,
      filename: 'a.ts',
      errors: [{ message: '"Bar": interface e tipo levam o prefixo I, seguido de PascalCase — "IBar".' }],
    },
    {
      name: 'Should report a type parameter without the T prefix',
      code: `function pick<K>(key: K) {}`,
      filename: 'a.ts',
      errors: [{ message: '"K": o parâmetro de tipo leva o prefixo T, seguido de PascalCase — TValues, TData.' }],
    },
    { name: 'Should report an I prefix not followed by PascalCase', code: `interface Ifoo { a: string }`, filename: 'a.ts', errors: [{ message: '"Ifoo": interface e tipo levam o prefixo I, seguido de PascalCase — "IIfoo".' }] },
    { name: 'Should report a class type parameter without the T prefix', code: `class Box<Item> {}`, filename: 'a.ts', errors: [{ message: '"Item": o parâmetro de tipo leva o prefixo T, seguido de PascalCase — TValues, TData.' }] },
    { name: 'Should report each type parameter without the T prefix', code: `type IPair<Tkey, V> = [Tkey, V];`, filename: 'a.ts', errors: [{ message: '"Tkey": o parâmetro de tipo leva o prefixo T, seguido de PascalCase — TValues, TData.' }, { message: '"V": o parâmetro de tipo leva o prefixo T, seguido de PascalCase — TValues, TData.' }] },
  ],
});
