import { Download } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Screen } from '@/shared/components/Screen/Screen';
import { APP_VERSION } from '@/shared/constants/appVersion';
import { useAppVersionLockStore } from '@/shared/store/appVersionLock.store';

/** Para quem tem o app abaixo da versão mínima: só o aviso, sem saída além de instalar a versão nova. */
export function UpdateRequiredPage() {
  const { theme } = useUnistyles();
  const requiredVersion = useAppVersionLockStore((state) => state.requiredVersion);
  // Sem versão exigida a guarda já fechou a tela: no instante até ela sair da pilha, não há o que pedir.
  if (requiredVersion === null) return null;

  return (
    <Screen>
      <View style={styles.content}>
        <CircleMark size={72} color="primaryContainer">
          <Download size={32} color={theme.colors.onPrimaryContainer} />
        </CircleMark>
        <AppText variant="headlineSmallEmphasized">Atualize o app</AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          {`A versão ${APP_VERSION} do Livro-Caixa, instalada neste celular, não abre mais. Para continuar, instale a versão ${requiredVersion} ou uma mais nova.`}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.largeIncreased,
    paddingHorizontal: theme.spacing.extraExtraLarge,
    paddingBottom: theme.spacing.extraExtraExtraLarge,
  },
}));
