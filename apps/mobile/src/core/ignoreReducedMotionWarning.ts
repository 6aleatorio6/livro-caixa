import { LogBox } from 'react-native';

// Só em desenvolvimento: a Reanimated avisa na importação que o "reduzir movimento" do aparelho está ligado, e a rodada
// das jornadas o liga ao desligar as animações. O aviso do Metro ("Open debugger to view warnings.") cobre a barra de
// navegação e engole o toque. Fora do desenvolvimento a Reanimated não avisa.
if (__DEV__) {
  LogBox.ignoreLogs(['Reduced motion setting is enabled on this device']);
}
