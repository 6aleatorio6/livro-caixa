import { authenticateWithBiometrics } from '@/shared/utils/biometrics/authenticateWithBiometrics';
import { setBiometricsEnabled } from '@/shared/utils/biometrics/setBiometricsEnabled';
import { unlockApp } from '@/shared/utils/biometrics/unlockApp';

/**
 * Pede a digital ou o rosto, com o PIN do aparelho como alternativa, e libera o app no sucesso. Cancelar, errar ou
 * ficar sem tentativas deixa o app bloqueado, com o botão para pedir de novo. Sem biometria cadastrada (a pessoa a
 * apagou do celular com a opção ligada), a opção desliga e o app abre: pedir de novo nunca daria certo e a trancaria
 * fora. Libera antes de gravar a opção, para que um arquivo que não grava não a deixe presa.
 */
export async function unlockWithBiometrics() {
  const result = await authenticateWithBiometrics('Abrir o Livro-Caixa');

  if (result.success) {
    unlockApp();
  } else if (result.error === 'not_enrolled') {
    unlockApp();
    setBiometricsEnabled(false);
  }
}
