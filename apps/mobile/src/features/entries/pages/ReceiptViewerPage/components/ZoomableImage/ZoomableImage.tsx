import { useState } from 'react';
import { ActivityIndicator, type LayoutChangeEvent, View } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ScopedTheme, StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/shared/components/AppText/AppText';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;

export interface IZoomableImageProps {
  uri: string;
  /** A imagem não abriu (o arquivo está corrompido ou a rede caiu). */
  onError: () => void;
}

/**
 * A imagem do comprovante em tela cheia: cabe inteira na área (`contain`); a pinça aproxima de 1× a 4×, dois
 * toques alternam 1× e 2×, e só com zoom dá para arrastar. Escrita com o RNGH 3 e a Reanimated 4 porque o
 * `maximumZoomScale` do `ScrollView` é só do iOS. O zoom parte do centro da área, não do ponto entre os dedos.
 */
export function ZoomableImage({ uri, onError }: IZoomableImageProps) {
  const { theme } = useUnistyles();
  const [isLoading, setIsLoading] = useState(true);
  // A dica some no primeiro gesto e não volta enquanto a imagem está aberta.
  const [hasGestured, setHasGestured] = useState(false);

  // `.get()` e `.set()`, nunca `.value`: o React Compiler tomaria `scale.value` de um callback como dependência
  // e o leria a cada renderização, e a Reanimated avisa ("Reading from `value` during component render").
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const areaWidth = useSharedValue(0);
  const areaHeight = useSharedValue(0);
  // O mesmo fato no thread da UI: o salto ao thread JS acontece só no primeiro gesto, não a cada um.
  const hasGesturedOnUi = useSharedValue(false);

  function markGestured() {
    'worklet';
    if (hasGesturedOnUi.get()) return;
    hasGesturedOnUi.set(true);
    scheduleOnRN(setHasGestured, true);
  }

  const pinch = usePinchGesture({
    onBegin: () => {
      'worklet';
      markGestured();
    },
    onUpdate: (event) => {
      'worklet';
      scale.set(Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.get() * event.scale)));
    },
    onDeactivate: () => {
      'worklet';
      savedScale.set(scale.get());
      if (scale.get() === MIN_SCALE) {
        translateX.set(withTiming(0));
        translateY.set(withTiming(0));
        savedX.set(0);
        savedY.set(0);
      }
    },
  });

  // Sem zoom, o arrastar não move nada. Um `enabled` com valor compartilhado seria lido pelo RNGH durante a
  // renderização, e a Reanimated avisaria ("Reading from `value` during component render").
  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      markGestured();
    },
    onUpdate: (event) => {
      'worklet';
      if (scale.get() <= MIN_SCALE) return;
      // Não deixa arrastar além da borda da área ampliada.
      const maxX = (areaWidth.get() * (scale.get() - 1)) / 2;
      const maxY = (areaHeight.get() * (scale.get() - 1)) / 2;
      translateX.set(Math.min(maxX, Math.max(-maxX, savedX.get() + event.translationX)));
      translateY.set(Math.min(maxY, Math.max(-maxY, savedY.get() + event.translationY)));
    },
    onDeactivate: () => {
      'worklet';
      savedX.set(translateX.get());
      savedY.set(translateY.get());
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      markGestured();
      const target = scale.get() > MIN_SCALE ? MIN_SCALE : DOUBLE_TAP_SCALE;
      scale.set(withTiming(target));
      savedScale.set(target);
      translateX.set(withTiming(0));
      translateY.set(withTiming(0));
      savedX.set(0);
      savedY.set(0);
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }, { translateY: translateY.get() }, { scale: scale.get() }],
  }));

  function measure({ nativeEvent }: LayoutChangeEvent) {
    areaWidth.set(nativeEvent.layout.width);
    areaHeight.set(nativeEvent.layout.height);
  }

  return (
    <View style={styles.area} onLayout={measure}>
      <GestureDetector gesture={gesture}>
        <Animated.Image
          source={{ uri }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Comprovante"
          style={[styles.image, imageStyle]}
          onLoad={() => setIsLoading(false)}
          onError={onError}
        />
      </GestureDetector>
      {isLoading ? <ActivityIndicator style={styles.loader} color={theme.colors.primary} /> : null}
      {/* A dica monta depois da imagem carregar, fora da janela em que o `ScopedTheme` da tela aplica o tema escuro: ela leva o seu. */}
      {!isLoading && !hasGestured ? (
        <ScopedTheme name="dark">
          <View style={styles.hint} pointerEvents="none">
            <AppText variant="labelSmall" color="onSurfaceVariant" style={styles.hintText}>
              Abra os dedos ou toque duas vezes para aproximar.
            </AppText>
          </View>
        </ScopedTheme>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  area: { flex: 1, overflow: 'hidden' },
  image: { flex: 1, width: '100%' },
  loader: { ...StyleSheet.absoluteFillObject },
  hint: { position: 'absolute', bottom: theme.spacing.large, alignSelf: 'center' },
  hintText: { textAlign: 'center' },
}));
