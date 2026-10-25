import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { TagChip } from '@/shared/components/TagChip/TagChip';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';
import type { ITag } from '@/shared/types/tag/Tag';

export interface ITagChoiceProps extends IInputMinimalProps<string | null> {
  tags: ITag[];
}

/** As tags da família como chips que quebram de linha; tocar no escolhido tira a tag (`null`). */
export function TagChoice({ tags, value, onValueChange, onBlur }: ITagChoiceProps) {
  return (
    <View style={styles.chips}>
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          isSelected={tag.id === value}
          onPress={() => {
            onValueChange(tag.id === value ? null : tag.id);
            onBlur();
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
}));
