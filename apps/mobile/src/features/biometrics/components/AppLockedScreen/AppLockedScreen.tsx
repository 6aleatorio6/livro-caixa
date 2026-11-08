import { FingerprintPattern } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Modal, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { unlockWithBiometrics } from '@/features/biometrics/utils/unlockWithBiometrics';
import { AppText } from '@/shared/components/AppText/AppText';
import { BrandMark } from '@/shared/components/BrandMark/BrandMark';
import { Button } from '@/shared/components/Button/Button';
import { Screen } from '@/shared/components/Screen/Screen';

/** O Voltar do Android pede para fechar o `Modal`; este só fecha desbloqueado, então o pedido não faz nada. */
function ignoreBackButton() {}

/**
 * A tela "App bloqueado": um `Modal` em tela cheia por cima da pilha, que continua montada embaixo com as telas abertas
 * e os rascunhos. Pede a biometria ao aparecer; cancelado, fica o botão para pedir de novo. Quem decide quando ela
 * aparece e quando sai da árvore é o layout raiz. Aparece sem animação (`animationType="none"`): o `fade` deixaria o
 * Início, com os totais do mês, à mostra por baixo enquanto a tela entra.
 */
export function AppLockedScreen() {
  // O primeiro pedido abre junto com a tela: o botão já nasce ocupado, e enquanto o pedido do sistema está aberto ele não
  // aceita toque, então não abre um segundo pedido por cima.
  const [isUnlocking, setIsUnlocking] = useState(true);

  async function askBiometrics() {
    try {
      await unlockWithBiometrics();
    } catch (error) {
      // O app fica como está: bloqueado, com o botão para pedir de novo, ou já aberto se o erro veio depois de abrir.
      console.warn('Não deu para pedir a biometria.', error);
    } finally {
      setIsUnlocking(false);
    }
  }

  function askBiometricsAgain() {
    setIsUnlocking(true);
    askBiometrics();
  }

  useEffect(() => {
    // O Android descarta sem responder o pedido feito com a atividade parada (a pessoa mandou o app para o segundo plano
    // durante a splash): a promessa nunca resolveria e o botão giraria para sempre. Então fora de `active` espera o
    // primeiro `active` e pede uma vez. Não pede de novo a cada volta: no Android 10 ou anterior a tela do PIN é uma
    // atividade, e cancelá-la tira o app de `active` e o devolve, o que faria um laço.
    if (AppState.currentState === 'active') {
      askBiometrics();
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      subscription.remove();
      askBiometrics();
    });
    return () => subscription.remove();
  }, []);

  return (
    <Modal visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={ignoreBackButton}>
      <Screen>
        <View style={styles.content}>
          <BrandMark />
          <AppText variant="bodyLarge" color="onSurfaceVariant">
            Use a digital ou o rosto para abrir o app.
          </AppText>
          <View style={styles.space} />
          <Button label="Desbloquear" icon={FingerprintPattern} onPress={askBiometricsAgain} isLoading={isUnlocking} />
        </View>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.extraExtraLarge,
    paddingBottom: theme.spacing.extraExtraExtraLarge,
  },
  space: { height: theme.spacing.extraLarge },
}));
