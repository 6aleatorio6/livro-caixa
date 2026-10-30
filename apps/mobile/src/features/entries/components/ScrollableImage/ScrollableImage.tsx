import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface IScrollableImageProps {
  uri: string;
  /** A imagem não abriu (o arquivo está corrompido ou a rede caiu). */
  onError: () => void;
}

/**
 * A imagem do comprovante na largura da área, com a altura da proporção dela: um print longo rola na vertical até o
 * fim, e a imagem mais baixa que a área fica no topo. Sem zoom.
 */
export function ScrollableImage({ uri, onError }: IScrollableImageProps) {
  const { theme } = useUnistyles();
  // A proporção chega no `onLoad`. Até lá, a imagem é quadrada: com altura zero, ela não carregaria.
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  return (
    <View style={styles.area}>
      <ScrollView>
        <Image
          source={{ uri }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Comprovante"
          style={styles.image(aspectRatio ?? 1)}
          onLoad={({ nativeEvent }) => {
            const { width, height } = nativeEvent.source;
            // Sem dimensões, a proporção seria NaN ou infinita; a imagem fica quadrada.
            setAspectRatio(width > 0 && height > 0 ? width / height : 1);
          }}
          onError={onError}
        />
      </ScrollView>
      {aspectRatio === null ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} accessibilityLabel="Carregando" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  image: (aspectRatio: number) => ({ width: '100%', aspectRatio }),
  loader: { ...StyleSheet.absoluteFillObject },
});
