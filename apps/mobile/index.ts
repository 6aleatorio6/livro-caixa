// O aviso da Reanimated é registrado quando ela é importada: a lista de avisos ignorados vem antes de qualquer tela.
import './src/core/ignoreReducedMotionWarning';
import 'expo-router/entry';
// O Unistyles lê cada StyleSheet assim que o arquivo é importado: a configuração vem antes de
// qualquer tela.
import './src/core/theme/unistyles';
import './src/core/yupLocale';
import './src/core/configureGoogleSignIn';
