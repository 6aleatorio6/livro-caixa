import { router } from 'expo-router';
import { Tag } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { tagsSupport } from '@/features/settings/utils/tagsSupport';

/** A linha "Tags" de Configurações, com a própria leitura: a página não renderiza de novo a cada mudança das tags. */
export function TagsRow() {
  const { data: tags } = useRealtime(tagListQueryService, {});

  return <ListItem icon={Tag} title="Tags" support={tags ? tagsSupport(tags) : undefined} onPress={() => router.push('/tags')} />;
}
