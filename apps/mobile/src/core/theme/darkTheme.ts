import { opacity } from './opacity';
import { radii } from './radii';
import { spacing } from './spacing';
import { typography } from './typography';
import type { IThemeColors } from '@/core/types/ThemeColors';

// Papéis de cor do tema escuro, com as variáveis do design.
const colors: IThemeColors = {
  primary: '#ABD0B0',
  onPrimary: '#173721',
  primaryContainer: '#2E4E36',
  onPrimaryContainer: '#C6ECCB',
  secondary: '#BCCABB',
  onSecondary: '#273329',
  secondaryContainer: '#3D4A3F',
  onSecondaryContainer: '#D8E6D7',
  tertiary: '#98D0DB',
  onTertiary: '#00363E',
  tertiaryContainer: '#0E4E58',
  onTertiaryContainer: '#B4ECF8',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#8E1313',
  onErrorContainer: '#FFDAD6',
  surface: '#101411',
  onSurface: '#E0E3DD',
  onSurfaceVariant: '#BECABD',
  surfaceDim: '#101411',
  surfaceBright: '#363A36',
  surfaceContainerLowest: '#0B0F0C',
  surfaceContainerLow: '#191D19',
  surfaceContainer: '#1D211D',
  surfaceContainerHigh: '#272B27',
  surfaceContainerHighest: '#323632',
  inverseSurface: '#E0E3DD',
  inverseOnSurface: '#2D312D',
  inversePrimary: '#45664C',
  outline: '#899488',
  outlineVariant: '#3F4940',
  shadow: '#000000',
  scrim: '#000000',
  tagWood: '#F7C493',
  tagMoss: '#C0C683',
  tagPetrol: '#7ED6C7',
  tagSlate: '#BDC1C4',
  tagBlue: '#9BDAFF',
  tagIndigo: '#ADB9F8',
  tagLavender: '#E7C0FB',
  tagPlum: '#ECA6C2',
  onTag: '#101411',
};

export const darkTheme = { colors, typography, spacing, radii, opacity } as const;
