// Os 15 papéis de tipografia do Material 3 na Figtree, com as variáveis do design (a altura de linha
// do design é uma razão do tamanho; aqui vai em px), e as 15 variantes "emphasized", de peso maior.
const FONT_FAMILY = 'Figtree';

const baseRoles = {
  displayLarge: { fontFamily: FONT_FAMILY, fontSize: 57, lineHeight: 64, fontWeight: '400', letterSpacing: -0.25 },
  displayMedium: { fontFamily: FONT_FAMILY, fontSize: 45, lineHeight: 52, fontWeight: '400', letterSpacing: 0 },
  displaySmall: { fontFamily: FONT_FAMILY, fontSize: 36, lineHeight: 44, fontWeight: '400', letterSpacing: 0 },
  headlineLarge: { fontFamily: FONT_FAMILY, fontSize: 32, lineHeight: 40, fontWeight: '400', letterSpacing: 0 },
  headlineMedium: { fontFamily: FONT_FAMILY, fontSize: 28, lineHeight: 36, fontWeight: '400', letterSpacing: 0 },
  headlineSmall: { fontFamily: FONT_FAMILY, fontSize: 24, lineHeight: 32, fontWeight: '400', letterSpacing: 0 },
  titleLarge: { fontFamily: FONT_FAMILY, fontSize: 22, lineHeight: 28, fontWeight: '400', letterSpacing: 0 },
  titleMedium: { fontFamily: FONT_FAMILY, fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
  titleSmall: { fontFamily: FONT_FAMILY, fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
  bodyLarge: { fontFamily: FONT_FAMILY, fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.25 },
  bodyMedium: { fontFamily: FONT_FAMILY, fontSize: 15, lineHeight: 22, fontWeight: '400', letterSpacing: 0.15 },
  bodySmall: { fontFamily: FONT_FAMILY, fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: 0.2 },
  labelLarge: { fontFamily: FONT_FAMILY, fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
  labelMedium: { fontFamily: FONT_FAMILY, fontSize: 13, lineHeight: 18, fontWeight: '500', letterSpacing: 0.3 },
  labelSmall: { fontFamily: FONT_FAMILY, fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.4 },
} as const;

export const typography = {
  ...baseRoles,
  displayLargeEmphasized: { ...baseRoles.displayLarge, fontWeight: '600' },
  displayMediumEmphasized: { ...baseRoles.displayMedium, fontWeight: '600' },
  displaySmallEmphasized: { ...baseRoles.displaySmall, fontWeight: '600' },
  headlineLargeEmphasized: { ...baseRoles.headlineLarge, fontWeight: '600' },
  headlineMediumEmphasized: { ...baseRoles.headlineMedium, fontWeight: '600' },
  headlineSmallEmphasized: { ...baseRoles.headlineSmall, fontWeight: '600' },
  titleLargeEmphasized: { ...baseRoles.titleLarge, fontWeight: '600' },
  titleMediumEmphasized: { ...baseRoles.titleMedium, fontWeight: '700' },
  titleSmallEmphasized: { ...baseRoles.titleSmall, fontWeight: '700' },
  bodyLargeEmphasized: { ...baseRoles.bodyLarge, fontWeight: '600' },
  bodyMediumEmphasized: { ...baseRoles.bodyMedium, fontWeight: '600' },
  bodySmallEmphasized: { ...baseRoles.bodySmall, fontWeight: '600' },
  labelLargeEmphasized: { ...baseRoles.labelLarge, fontWeight: '700' },
  labelMediumEmphasized: { ...baseRoles.labelMedium, fontWeight: '700' },
  labelSmallEmphasized: { ...baseRoles.labelSmall, fontWeight: '700' },
} as const;
