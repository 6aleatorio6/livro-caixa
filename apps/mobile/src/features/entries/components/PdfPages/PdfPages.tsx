import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { ScopedTheme, StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

export interface IPdfPagesProps {
  /** O `data:application/pdf;base64,…` lido do Firestore, ou o arquivo ainda no celular. */
  uri: string;
  /**
   * O nome do arquivo em que a biblioteca grava o `data:` antes de abri-lo: o id do registro do comprovante. Sem um
   * nome, ela calcula o SHA1 do base64 inteiro para dar um. O arquivo é regravado a cada abertura, sem o `cache` da
   * biblioteca: ela não apaga o arquivo que não abriu, e um arquivo cortado ficaria para as próximas aberturas.
   */
  cacheFileName?: string;
  /** O PDF não abriu (o arquivo está corrompido ou tem senha). */
  onError: () => void;
}

/** O PDF do comprovante dentro do app: todas as páginas rolam na vertical, com o zoom da própria biblioteca, e o "página de total" aparece quando há mais de uma. */
export function PdfPages({ uri, cacheFileName, onError }: IPdfPagesProps) {
  const { theme } = useUnistyles();
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  return (
    // O rótulo chega só com o PDF aberto: é a marca de que o comprovante está na tela. A imagem do `ScrollableImage`
    // tem o rótulo desde a montagem.
    <View style={styles.area} accessibilityLabel={pageCount === null ? undefined : 'Comprovante'}>
      <Pdf
        // A biblioteca só tira o `file://` do arquivo local e leria o `file:/data/...` de uma barra, que o `expo-sharing`
        // entrega, como um caminho cru.
        source={{ uri: uri.replace(/^file:\/(?!\/)/, 'file:///'), cacheFileName }}
        style={styles.pdf}
        // Sem isto, a biblioteca escreve "0.00%" no meio da área enquanto grava o `data:` no arquivo, por baixo do
        // indicador de carga da peça.
        renderActivityIndicator={() => <></>}
        // O padrão da biblioteca (`true`) derruba o download no Android ("Use of own trust manager but none defined")
        // e aceitaria qualquer certificado.
        trustAllCerts={false}
        onLoadComplete={(numberOfPages) => setPageCount(numberOfPages)}
        onPageChanged={(current) => setPage(current)}
        onError={onError}
      />
      {pageCount === null ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} accessibilityLabel="Carregando" />
      ) : null}
      {/* O indicador monta depois do visualizador, fora da janela em que o `ScopedTheme` da tela aplica o tema escuro: ele leva o seu. */}
      {pageCount !== null && pageCount > 1 ? (
        <ScopedTheme name="dark">
          <View style={styles.indicator} pointerEvents="none">
            <AppText variant="labelMedium" color="inverseOnSurface">{`${page} de ${pageCount}`}</AppText>
          </View>
        </ScopedTheme>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  area: {
    flex: 1,
    // O fundo atrás das páginas é um cinza do design que não tem papel no tema.
    // eslint-disable-next-line no-restricted-syntax
    backgroundColor: '#3A3B37',
  },
  pdf: { flex: 1, backgroundColor: 'transparent' },
  loader: { ...StyleSheet.absoluteFillObject },
  indicator: {
    position: 'absolute',
    bottom: theme.spacing.large,
    alignSelf: 'center',
    paddingVertical: theme.spacing.extraSmallIncreased,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.inverseSurface,
  },
}));
