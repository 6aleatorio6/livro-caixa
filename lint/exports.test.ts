import { describe, it } from 'node:test';
import { RuleTester } from 'oxlint/plugins-dev';
import exportsPlugin from './exports.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester();

tester.run('one-export-per-file', exportsPlugin.rules['one-export-per-file'], {
  valid: [
    { name: 'Should accept the props interface next to its component', code: `export const Button = () => null;\nexport interface IButtonProps { a: string }`, filename: 'Button.tsx' },
    { name: 'Should ignore re-exports', code: `export { a } from './a';\nexport { b } from './b';`, filename: 'index.ts' },
    { name: 'Should ignore value constants and what is not exported', code: `export const USER_ROLES = ['a'] as const;\nexport type IUserRole = (typeof USER_ROLES)[number];\nfunction helper() {}`, filename: 'UserRole.ts' },
    { name: 'Should count the overloads of a function once', code: `export function pick(a: string): string;\nexport function pick(a: number): number;\nexport function pick(a: unknown) { return a; }`, filename: 'pick.ts' },
  ],
  invalid: [
    {
      name: 'Should report the second exported function',
      code: `export function first() {}\nexport function second() {}`,
      filename: 'two.ts',
      errors: [{ message: '"second" vai para um arquivo próprio: este já exporta "first".' }],
    },
    {
      name: 'Should count a constant that holds a function and an export list without source',
      code: `export const useSession = createStore();\nconst b = 1;\nexport { b };`,
      filename: 'store.ts',
      errors: [{ message: '"b" vai para um arquivo próprio: este já exporta "useSession".' }],
    },
    {
      name: 'Should report a props interface whose component is not exported',
      code: `export interface IButtonProps { a: string }\nexport interface IOther { a: string }`,
      filename: 'props.ts',
      errors: [{ message: '"IOther" vai para um arquivo próprio: este já exporta "IButtonProps".' }],
    },
  ],
});

tester.run('name-matches-file', exportsPlugin.rules['name-matches-file'], {
  valid: [
    { name: 'Should accept an export named like the file', code: `export function createAsyncAction() {}`, filename: 'createAsyncAction.ts' },
    { name: 'Should accept the I-prefixed type of the file name', code: `export interface IRealtimeState { a: string }`, filename: 'RealtimeState.ts' },
    { name: 'Should compare ignoring case and underscore, up to the first dot', code: `export const USER_ROLES = () => null;`, filename: 'userRoles.test.ts' },
    { name: 'Should accept use<Name>Store in a .store.ts file', code: `export const useToastStore = create();`, filename: 'Toast.store.ts' },
    { name: 'Should accept when one of the declarations carries the file name', code: `export function Button() {}\nexport function other() {}`, filename: 'Button.tsx' },
    { name: 'Should accept a file with only value constants', code: `export const SIZES = [1, 2];`, filename: 'anything.ts' },
    { name: 'Should accept a file with only re-exports', code: `export { a } from './a';`, filename: 'index.ts' },
  ],
  invalid: [
    {
      name: 'Should report an export that does not carry the file name',
      code: `export function createAsyncAction() {}`,
      filename: 'asyncAction.ts',
      errors: [{ message: 'O arquivo exporta "createAsyncAction", e nenhum leva o nome dele ("asyncAction"): renomeie o arquivo ou a declaração.' }],
    },
    {
      name: 'Should list every declaration in the message and point at the first',
      code: `export function a() {}\nexport function b() {}`,
      filename: 'c.ts',
      errors: [{ message: 'O arquivo exporta "a", "b", e nenhum leva o nome dele ("c"): renomeie o arquivo ou a declaração.' }],
    },
    { name: 'Should reject use<Name>Store outside a .store.ts file', code: `export const useToastStore = create();`, filename: 'Toast.ts', errors: [{ message: 'O arquivo exporta "useToastStore", e nenhum leva o nome dele ("Toast"): renomeie o arquivo ou a declaração.' }] },
    { name: 'Should reject an I-prefixed type that is not the file name', code: `export interface IFoo { a: string }`, filename: 'Bar.ts', errors: [{ message: 'O arquivo exporta "IFoo", e nenhum leva o nome dele ("Bar"): renomeie o arquivo ou a declaração.' }] },
  ],
});

tester.run('type-in-types-folder', exportsPlugin.rules['type-in-types-folder'], {
  valid: [
    { name: 'Should accept a type inside a types folder', code: `export interface IUser { id: string }`, filename: 'src/shared/types/User.ts' },
    { name: 'Should accept a type inside a types folder of a feature', code: `export type IId = string;`, filename: 'src/features/home/types/Id.ts' },
    { name: 'Should accept the props interface of an exported component', code: `export const Button = () => null;\nexport interface IButtonProps { a: string }`, filename: 'src/shared/components/Button.tsx' },
    { name: 'Should accept a type derived by typeof from a constant of the file', code: `export const USER_ROLES = ['a'] as const;\nexport type IUserRole = (typeof USER_ROLES)[number];`, filename: 'src/shared/utils/UserRole.ts' },
    { name: 'Should ignore what is not a type', code: `export function login() {}\nexport const SIZES = [1];`, filename: 'src/shared/utils/login.ts' },
  ],
  invalid: [
    {
      name: 'Should report a type outside a types folder',
      code: `export interface IUser { id: string }`,
      filename: 'src/shared/utils/User.ts',
      errors: [{ message: 'O tipo "IUser" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).' }],
    },
    { name: 'Should report a type alias outside a types folder', code: `export type IId = string;`, filename: 'src/shared/utils/Id.ts', errors: [{ message: 'O tipo "IId" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).' }] },
    { name: 'Should report a type exported through an export list', code: `interface IUser { id: string }\nexport type { IUser };`, filename: 'src/shared/utils/User.ts', errors: [{ message: 'O tipo "IUser" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).' }] },
    { name: 'Should report a props interface without its exported component', code: `export interface IButtonProps { a: string }`, filename: 'src/shared/components/Button.tsx', errors: [{ message: 'O tipo "IButtonProps" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).' }] },
    { name: 'Should report a typeof of something that is not a constant of the file', code: `export type IRole = typeof OTHER;`, filename: 'src/shared/utils/Role.ts', errors: [{ message: 'O tipo "IRole" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).' }] },
  ],
});
