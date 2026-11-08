import { createBiometricsOptionFile } from './createBiometricsOptionFile';

/**
 * Lê se a opção "Entrar com biometria" está ligada neste celular. Síncrona, porque a splash espera por ela na abertura a
 * frio. Sem arquivo, ou com um que não dá para ler ou que não diz `true`, a opção vale desligada: errar para o lado
 * ligado trancaria a pessoa fora do app por um arquivo estragado.
 */
export function readBiometricsEnabled(): boolean {
  const file = createBiometricsOptionFile();
  if (!file.exists) return false;

  try {
    return file.textSync() === 'true';
  } catch {
    return false;
  }
}
