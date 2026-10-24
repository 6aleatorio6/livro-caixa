import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

const themes = { light: lightTheme, dark: darkTheme };

type IAppThemes = typeof themes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends IAppThemes {}
}

// O tema segue o do sistema: claro ou escuro, conforme o celular.
StyleSheet.configure({ themes, settings: { adaptiveThemes: true } });
