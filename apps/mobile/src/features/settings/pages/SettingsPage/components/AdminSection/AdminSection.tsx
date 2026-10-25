import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { peopleCount } from '@/shared/utils/format/peopleCount';

/**
 * O que só o admin vê em Configurações: o caminho para a tela de e-mails permitidos, com quantas pessoas há na
 * família. É um componente à parte porque só o admin tem essa tela (as regras deixam todo membro ler a lista).
 */
export function AdminSection() {
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  return (
    <View style={styles.section}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        Só para o admin
      </AppText>
      <ListItem
        icon={Mail}
        title="E-mails permitidos"
        support={people ? `${peopleCount(people.length)} na família` : undefined}
        onPress={() => router.push('/allowed-emails')}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.extraExtraSmall },
}));
