import { Image, type ImageSourcePropType, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

export interface IEmptyStateProps {
  image: ImageSourcePropType;
  title: string;
  text: string;
}

/** O que a tela mostra quando não há nada para listar: a ilustração, o título e uma frase que diz o que fará algo aparecer. */
export function EmptyState({ image, title, text }: IEmptyStateProps) {
  return (
    <View style={styles.container}>
      <Image source={image} accessible={false} style={styles.image} resizeMode="contain" />
      <AppText variant="titleMediumEmphasized" style={styles.centered}>
        {title}
      </AppText>
      <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.centered}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.extraLarge,
    paddingHorizontal: theme.spacing.small,
  },
  image: { width: 300, height: 200 },
  centered: { textAlign: 'center' },
}));
