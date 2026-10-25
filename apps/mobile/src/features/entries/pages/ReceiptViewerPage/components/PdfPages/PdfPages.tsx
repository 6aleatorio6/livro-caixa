import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { ScopedTheme, StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

export interface IPdfPagesProps {
  uri: string;
  /** O id do registro do comprovante: o nome do arquivo guardado no aparelho, para abrir de novo sem baixar. */
  fileId: string;
  /** O PDF não abriu (o arquivo está corrompido ou a rede caiu). */
  onError: () => void;
}

/** O PDF do comprovante dentro do app: todas as páginas rolam na vertical, com o zoom da própria biblioteca, e o "página de total" aparece quando há mais de uma. */
export function PdfPages({ uri, fileId, onError }: IPdfPagesProps) {
  const { theme } = useUnistyles();
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  return (
    <View style={styles.area}>
      <Pdf
        source={{ uri, cache: true, cacheFileName: fileId }}
        style={styles.pdf}
        // O padrão da biblioteca (`true`) derruba o download no Android ("Use of own trust manager but none defined")
        // e aceitaria qualquer certificado.
        trustAllCerts={false}
        onLoadComplete={(numberOfPages) => setPageCount(numberOfPages)}
        onPageChanged={(current) => setPage(current)}
        onError={onError}
      />
      {pageCount === null ? <ActivityIndicator style={styles.loader} color={theme.colors.primary} /> : null}
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
