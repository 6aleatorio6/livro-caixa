import { authenticateWithBiometrics } from '@/shared/utils/biometrics/authenticateWithBiometrics';
import { setBiometricsEnabled } from '@/shared/utils/biometrics/setBiometricsEnabled';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

/**
 * Liga a entrada com biometria só depois de a pessoa passar por ela uma vez: assim ela sabe que consegue, e a opção
 * não a tranca fora do app na próxima abertura. Cancelar não é erro: a opção continua desligada, sem aviso. O pedido é o
 * mesmo do bloqueio, com o PIN do aparelho como alternativa.
 */
export const doTurnOnBiometrics = createAsyncAction({
  run: async () => {
    const result = await authenticateWithBiometrics('Confirme para ligar a entrada com biometria');
    if (result.success) setBiometricsEnabled(true);
  },
});
