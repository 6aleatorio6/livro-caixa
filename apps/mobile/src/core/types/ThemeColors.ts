import type { lightTheme } from '@/core/theme/lightTheme';

/** Os papéis de cor que todo tema preenche: os do tema claro, com qualquer valor. */
export type IThemeColors = Record<keyof (typeof lightTheme)['colors'], string>;
