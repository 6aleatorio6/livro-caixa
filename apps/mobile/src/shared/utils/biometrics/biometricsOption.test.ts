import { File } from 'expo-file-system';

import { createBiometricsOptionFile } from './createBiometricsOptionFile';
import { readBiometricsEnabled } from './readBiometricsEnabled';
import { writeBiometricsEnabled } from './writeBiometricsEnabled';

const mockStoredTexts = new Map<string, string>();

// Um sistema de arquivos em memória: guarda o texto de cada caminho, como o `File` guarda no celular. Um `File` novo a
// cada chamada, como o `createBiometricsOptionFile` faz.
jest.mock('expo-file-system', () => ({
  Paths: { document: 'file:///document' },
  File: jest.fn((...parts: string[]) => {
    const path = parts.join('/');
    return {
      exists: mockStoredTexts.has(path),
      textSync: () => {
        const text = mockStoredTexts.get(path);
        if (text === undefined) throw new Error('Arquivo inexistente');
        return text;
      },
      writeSync: (content: string) => mockStoredTexts.set(path, content),
    };
  }),
}));

beforeEach(() => {
  mockStoredTexts.clear();
});

describe('Biometrics option file', () => {
  it('Should read the option as off when the file does not exist', () => {
    expect(readBiometricsEnabled()).toBe(false);
  });

  it('Should read the option as on after it is written on', () => {
    writeBiometricsEnabled(true);

    expect(readBiometricsEnabled()).toBe(true);
  });

  it('Should read the option as off after it is written on and then off', () => {
    writeBiometricsEnabled(true);
    writeBiometricsEnabled(false);

    expect(readBiometricsEnabled()).toBe(false);
  });

  it('Should read the option as off when the content is corrupt', () => {
    createBiometricsOptionFile().writeSync('{"isEn');

    expect(readBiometricsEnabled()).toBe(false);
  });

  it('Should read the option as off when the file cannot be read', () => {
    writeBiometricsEnabled(true);
    jest.mocked(File).mockImplementationOnce(
      () =>
        ({
          exists: true,
          textSync: () => {
            throw new Error('Sem permissão de leitura');
          },
        }) as never,
    );

    expect(readBiometricsEnabled()).toBe(false);
  });
});
