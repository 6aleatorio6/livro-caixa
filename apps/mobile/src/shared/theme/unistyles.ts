import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from './dark-theme';
import { lightTheme } from './light-theme';

const themes = { light: lightTheme, dark: darkTheme };

type IAppThemes = typeof themes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends IAppThemes {}
}

// O tema segue o do sistema: claro ou escuro, conforme o celular.
StyleSheet.configure({ themes, settings: { adaptiveThemes: true } });
