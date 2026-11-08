import { authenticateAsync } from 'expo-local-authentication';

/**
 * Abre o pedido do sistema para a digital ou o rosto, com o PIN do aparelho como alternativa. As opções do pedido
 * ficam aqui para o bloqueio do app e a opção em Configurações pedirem do mesmo jeito; só o texto muda.
 */
export function authenticateWithBiometrics(promptMessage: string) {
  return authenticateAsync({ promptMessage, cancelLabel: 'Cancelar', disableDeviceFallback: false });
}
