import type { LucideIcon } from 'lucide-react-native';

import type { IColorRole } from '@/core/types/ColorRole';

/** A marca de um lançamento: o ícone e as cores do círculo e do ícone. */
export interface IEntryMark {
  icon: LucideIcon;
  markColor: IColorRole;
  iconColor: IColorRole;
}
