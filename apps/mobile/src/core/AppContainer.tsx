import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native-unistyles';

import { AppToast } from '@/core/components/AppToast/AppToast';
import { FullscreenLoaderModal } from '@/core/components/FullscreenLoaderModal/FullscreenLoaderModal';

export interface IAppContainerProps {
  children: ReactNode;
}

/**
 * A raiz do app: a raiz dos gestos, o provedor do teclado (que deixa o campo com foco acima dele), as telas e o que
 * fica por cima de todas, montado uma vez.
 */
export function AppContainer({ children }: IAppContainerProps) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        {children}
        <AppToast />
        <FullscreenLoaderModal />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

// O RNGH 3 pede a raiz para os gestos do zoom do comprovante.
const styles = StyleSheet.create({ root: { flex: 1 } });
