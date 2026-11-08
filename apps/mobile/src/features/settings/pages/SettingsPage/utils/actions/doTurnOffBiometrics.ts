import { setBiometricsEnabled } from '@/shared/utils/biometrics/setBiometricsEnabled';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

/** Desliga a entrada com biometria sem pedi-la: quem desliga não corre o risco de ficar de fora do app. */
export const doTurnOffBiometrics = createAsyncAction({ run: async () => setBiometricsEnabled(false) });
