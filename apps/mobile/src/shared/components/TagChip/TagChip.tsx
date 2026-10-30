import { ColorDot } from '@/shared/components/ColorDot/ColorDot';
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
      leading={<ColorDot color={tagColorRoles(color).mainRole} />}
      onPress={onPress}
    />
  );
}
