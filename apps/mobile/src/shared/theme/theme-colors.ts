import type { lightTheme } from './light-theme';

/** Os papéis de cor que todo tema preenche: os do tema claro, com qualquer valor. */
export type IThemeColors = Record<keyof (typeof lightTheme)['colors'], string>;
