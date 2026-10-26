import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { ScopedTheme, StyleSheet, useUnistyles } from 'react-native-unistyles';

import { EntryProblem } from '@/features/entries/components/EntryProblem/EntryProblem';
import { Screen } from '@/shared/components/Screen/Screen';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

import { ReceiptEntryStrip } from './components/ReceiptEntryStrip/ReceiptEntryStrip';
import { ReceiptProblem } from './components/ReceiptProblem/ReceiptProblem';
import { ZoomableImage } from './components/ZoomableImage/ZoomableImage';
import { useReceiptContent } from './hooks/useReceiptContent/useReceiptContent';

const CANNOT_OPEN = 'Não deu para abrir o comprovante.';
const NOT_FOUND = 'O comprovante não foi encontrado.';

/** O comprovante de um lançamento em tela cheia, no tema escuro: a imagem com zoom (o PDF chega como a imagem da página) e os dados do lançamento embaixo. Qualquer membro abre. */
export function ReceiptViewerPage() {
  const { theme } = useUnistyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status: entryStatus, data: entry } = useRealtime(entryQueryService, { id });
  const { status: fileStatus, data: file } = useRealtime(receiptFileQueryService, { id: entry?.receiptFileId ?? null });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const receipt = useReceiptContent(file ?? null);

  function body() {
    if (entryStatus === 'error' || fileStatus === 'error') return <ReceiptProblem message={CANNOT_OPEN} />;
    // Só o servidor diz que o lançamento ou o registro não existem: a leitura do aparelho pode estar atrasada.
    if (entryStatus === 'success' && !entry) return <ReceiptProblem message={<EntryProblem reason="deleted" />} />;
    if (fileStatus === 'success' && !file) return <ReceiptProblem message={NOT_FOUND} />;
    if (receipt.status === 'notFound') return <ReceiptProblem message={NOT_FOUND} />;
    if (receipt.status === 'error') return <ReceiptProblem message={CANNOT_OPEN} onRetry={receipt.retry} />;
    if (!file || !receipt.uri) return <ActivityIndicator style={styles.loader} color={theme.colors.primary} />;

    return <ZoomableImage key={receipt.attempt} uri={receipt.uri} onError={receipt.fail} />;
  }

  return (
    <ScopedTheme name="dark">
      <StatusBar style="light" />
      <Screen>
        <TopBar title={file?.name ?? ''} icon="close" />
        <View style={styles.area}>{body()}</View>
        {entry ? <ReceiptEntryStrip entry={entry} authorName={memberNameOf(entry.paidBy, people ?? [])} /> : null}
      </Screen>
    </ScopedTheme>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  loader: { flex: 1 },
});
