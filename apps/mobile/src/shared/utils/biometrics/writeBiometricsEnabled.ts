import { createBiometricsOptionFile } from './createBiometricsOptionFile';

/** Grava se a opção "Entrar com biometria" está ligada neste celular, criando o arquivo na primeira vez. */
export function writeBiometricsEnabled(isEnabled: boolean): void {
  createBiometricsOptionFile().writeSync(String(isEnabled));
}
