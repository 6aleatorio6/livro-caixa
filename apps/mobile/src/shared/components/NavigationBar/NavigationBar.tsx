import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/** A barra de navegação das abas. É ela que soma o recuo de baixo, por cima da barra de gestos. */
export function NavigationBar({ style, ...props }: ViewProps) {
  return <View accessibilityRole="tablist" {...props} style={[styles.bar, style]} />;
}

const styles = StyleSheet.create((theme, rt) => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainer,
    paddingTop: theme.spacing.medium,
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.large + rt.insets.bottom,
  },
}));
