import { Info } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';

/** O aviso no topo da alteração: o que muda para os meses ainda sem pagamento e o que não muda. */
export function EditNotice() {
  const { theme } = useUnistyles();

  return (
    <View style={styles.notice}>
      <Decorative>
        <Info size={20} color={theme.colors.onSurfaceVariant} />
      </Decorative>
      <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.text}>
        A mudança vale para os meses ainda sem pagamento. Os meses já pagos não mudam.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.medium,
    backgroundColor: theme.colors.surfaceContainer,
  },
  text: { flex: 1 },
}));
