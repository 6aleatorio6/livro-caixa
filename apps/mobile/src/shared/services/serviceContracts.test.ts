// O `fs` chega pelo `jest.requireActual`, com o tipo do que se usa: o app não tem os tipos do Node.
declare const __dirname: string;
const { readdirSync } = jest.requireActual<{
  readdirSync(path: string, options: object): string[];
}>('node:fs');

/** Os serviços que não rodam fora do celular, cada um com o motivo: o teste de página os mocka à mão. */
const WITHOUT_CONTRACT: Record<string, string> = {
  'auth/signInWithGoogleService.ts': 'O Google Sign-In é nativo, e uma pessoa confere o login de verdade.',
};

describe('Service contracts', () => {
  it('Should give every service its contract test', () => {
    const files = readdirSync(__dirname, { recursive: true });

    const servicesWithoutContract = files.filter(
      (file) =>
        file.endsWith('Service.ts') &&
        !(file in WITHOUT_CONTRACT) &&
        !files.includes(file.replace(/\.ts$/, '.contract.test.ts')),
    );

    expect(servicesWithoutContract).toEqual([]);
  });
});
