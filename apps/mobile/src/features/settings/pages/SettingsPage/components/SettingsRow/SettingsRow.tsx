import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface ISettingsRowProps {
  icon: LucideIcon;
  label: string;
}

/** Uma entrada de Configurações. Ainda não navega: as telas de destino entram nos próximos grupos. */
export function SettingsRow({ icon: Icon, label }: ISettingsRowProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.row}>
      <CircleMark size={40} color="secondaryContainer">
        <Icon size={20} color={theme.colors.onSecondaryContainer} />
      </CircleMark>
      <AppText variant="bodyLarge" style={styles.label}>
        {label}
      </AppText>
      <Decorative>
        <ChevronRight size={24} color={theme.colors.onSurfaceVariant} />
      </Decorative>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.large,
    paddingVertical: theme.spacing.mediumIncreased,
  },
  label: { flex: 1 },
}));
