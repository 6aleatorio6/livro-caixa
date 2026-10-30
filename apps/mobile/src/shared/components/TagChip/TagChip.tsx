import { StyleSheet } from 'react-native-unistyles';

import { Decorative } from '@/shared/components/Decorative/Decorative';
import { FilterChip } from '@/shared/components/FilterChip/FilterChip';
import type { ITagColor } from '@/shared/types/tag/TagColor';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

export interface ITagChipProps {
  name: string;
  color: ITagColor;
  /** Escolhida: o chip ganha o fundo e o `check`. */
  isSelected?: boolean;
  /** Sem `onPress` o chip é só um rótulo, como na prévia da tag. */
  onPress?: () => void;
}

/** O nome de uma tag com a bolinha da sua cor. Com `onPress` é um botão que anuncia se está escolhido. */
export function TagChip({ name, color, isSelected, onPress }: ITagChipProps) {
  return (
    <FilterChip
      label={name}
      isSelected={isSelected}
      leading={<Decorative style={styles.dot(color)} />}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  dot: (color: ITagColor) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[tagColorRoles(color).mainRole],
  }),
}));
