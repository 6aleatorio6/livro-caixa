import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { ScopedTheme, StyleSheet } from 'react-native-unistyles';

import { PdfPages } from '@/features/entries/components/PdfPages/PdfPages';
import { ReceiptProblem } from '@/features/entries/components/ReceiptProblem/ReceiptProblem';
import { ZoomableImage } from '@/features/entries/components/ZoomableImage/ZoomableImage';
import { Screen } from '@/shared/components/Screen/Screen';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import type { IReceipt } from '@/shared/types/file/Receipt';

/**
 * O comprovante ainda no celular (escolhido no formulário ou compartilhado de outro app) em tela cheia, no tema escuro,
 * para conferir o valor antes de digitá-lo. É o visualizador do lançamento sem a faixa de baixo: o lançamento ainda
 * não existe.
 */
export function ReceiptPreviewPage() {
  const { uri, name, type } = useLocalSearchParams<{ uri: string; name: string; type: IReceipt['type'] }>();
  const [hasFailed, setHasFailed] = useState(false);
  const fail = () => setHasFailed(true);

  return (
    <ScopedTheme name="dark">
      <StatusBar style="light" />
      <Screen>
        <TopBar title={name} icon="close" />
        <View style={styles.area}>
          {/* O arquivo é local: tentar de novo leria o mesmo arquivo. */}
          {hasFailed ? (
            <ReceiptProblem message="Não deu para abrir o comprovante." />
          ) : type === 'pdf' ? (
            <PdfPages uri={uri} onError={fail} />
          ) : (
            <ZoomableImage uri={uri} onError={fail} />
          )}
        </View>
      </Screen>
    </ScopedTheme>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
});
