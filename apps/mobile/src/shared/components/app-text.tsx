import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/shared/theme/color-role';
import type { ITypographyRole } from '@/shared/theme/typography-role';

export interface IAppTextProps extends TextProps {
  variant?: ITypographyRole;
  color?: IColorRole;
}

/** Todo texto do app: o tamanho, o peso e a cor saem dos papéis do tema, nunca de valores soltos. */
export function AppText({ variant = 'bodyLarge', color = 'onSurface', style, ...props }: IAppTextProps) {
  return <Text {...props} style={[styles.text(variant, color), style]} />;
}

const styles = StyleSheet.create((theme) => ({
  text: (variant: ITypographyRole, color: IColorRole) => ({
    ...theme.typography[variant],
    color: theme.colors[color],
  }),
}));
