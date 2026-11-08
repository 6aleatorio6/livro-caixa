import { authenticateWithBiometrics } from '@/shared/utils/biometrics/authenticateWithBiometrics';
import { setBiometricsEnabled } from '@/shared/utils/biometrics/setBiometricsEnabled';
import { unlockApp } from '@/shared/utils/biometrics/unlockApp';

/**
 * Pede a digital ou o rosto, com o PIN do aparelho como alternativa, e libera o app no sucesso. Cancelar, errar ou
 * ficar sem tentativas deixa o app bloqueado, com o botão para pedir de novo. Sem bloqueio de tela no celular (a pessoa
 * apagou a biometria e o PIN, a senha ou o padrão com a opção ligada), a opção desliga e o app abre: pedir de novo
 * nunca daria certo e a trancaria fora. No Android o `not_enrolled` só vem nesse caso: sem biometria e com o PIN, o
 * pedido segue pelo PIN. Libera antes de gravar a opção, para que um arquivo que não grava não a deixe presa.
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
