import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

import { BiometricsRow } from '@/features/settings/pages/SettingsPage/components/BiometricsRow/BiometricsRow';
import { NotificationsRow } from '@/features/settings/pages/SettingsPage/components/NotificationsRow/NotificationsRow';

/**
 * A seção "Neste celular" de Configurações: o que vale só para este aparelho. Sempre aparece, por causa das
 * notificações; quando a biometria some, quem decide é a própria linha.
 */
export function ThisPhoneSection() {
  return (
    <View style={styles.section}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        Neste celular
      </AppText>
      <BiometricsRow />
      <NotificationsRow />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.extraExtraSmall },
}));
