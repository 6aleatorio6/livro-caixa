import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton } from '@/shared/components/IconButton/IconButton';

export interface ITopBarProps {
  title: string;
}

/** A barra superior de uma tela fora das abas: o voltar, que desfaz a última navegação, e o título. */
export function TopBar({ title }: ITopBarProps) {
  return (
    <View style={styles.bar}>
      <IconButton icon={ArrowLeft} label="Voltar" color="onSurface" onPress={() => router.back()} />
      <AppText variant="titleLarge" accessibilityRole="header">
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.extraSmall,
    paddingLeft: theme.spacing.extraSmall,
    paddingRight: theme.spacing.large,
  },
}));
