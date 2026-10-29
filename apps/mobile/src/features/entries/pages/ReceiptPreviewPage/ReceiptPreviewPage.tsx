import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { ScopedTheme, StyleSheet } from 'react-native-unistyles';

import { ReceiptProblem } from '@/features/entries/components/ReceiptProblem/ReceiptProblem';
import { ZoomableImage } from '@/features/entries/components/ZoomableImage/ZoomableImage';
import { Screen } from '@/shared/components/Screen/Screen';
import { TopBar } from '@/shared/components/TopBar/TopBar';

/**
 * O comprovante ainda no celular (escolhido no formulário ou compartilhado de outro app) em tela cheia, no tema escuro,
 * para conferir o valor antes de digitá-lo. É o visualizador do lançamento sem a faixa de baixo: o lançamento ainda
 * não existe.
 */
export function ReceiptPreviewPage() {
  const { uri, name } = useLocalSearchParams<{ uri: string; name: string }>();
  const [hasFailed, setHasFailed] = useState(false);

  return (
    <ScopedTheme name="dark">
      <StatusBar style="light" />
      <Screen>
        <TopBar title={name} icon="close" />
        <View style={styles.area}>
          {/* O arquivo é local: tentar de novo leria o mesmo arquivo. */}
          {hasFailed ? (
            <ReceiptProblem message="Não deu para abrir o comprovante." />
          ) : (
            <ZoomableImage uri={uri} onError={() => setHasFailed(true)} />
          )}
        </View>
      </Screen>
    </ScopedTheme>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
