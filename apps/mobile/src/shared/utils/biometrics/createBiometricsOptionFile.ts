import { File, Paths } from 'expo-file-system';

/** O arquivo da opção "Entrar com biometria", na pasta de documentos do app: o sistema não o apaga com o cache. */
export function createBiometricsOptionFile(): File {
  return new File(Paths.document, 'biometricsEnabled.txt');
}
