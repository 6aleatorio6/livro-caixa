import { withAppBuildGradle, type ConfigPlugin } from 'expo/config-plugins';
import type { ConfigContext, ExpoConfig } from 'expo/config';

import packageJson from './package.json';

// O APK de release assina com a chave de `release/livro-caixa.keystore` (fora do Git). A senha vem do
// `RELEASE_KEYSTORE_PASSWORD` do `.env`, que o `pnpm apk` passa ao Gradle; sem ela, o `pnpm apk` para antes do build.
// O debug continua com a chave do modelo do Expo.
const RELEASE_SIGNING_CONFIG = `
        release {
            storeFile rootProject.file('../release/livro-caixa.keystore')
            storePassword System.getenv('RELEASE_KEYSTORE_PASSWORD')
            keyAlias 'livro-caixa'
            keyPassword System.getenv('RELEASE_KEYSTORE_PASSWORD')
        }`;

// O `prebuild` sem `--clean` aplica o plugin de novo sobre o build.gradle já gerado: a marca evita a segunda cópia.
const withReleaseSigning: ConfigPlugin = (config) =>
  withAppBuildGradle(config, (gradle) => {
    if (gradle.modResults.contents.includes('RELEASE_KEYSTORE_PASSWORD')) return gradle;
    gradle.modResults.contents = gradle.modResults.contents
      .replace(/signingConfigs \{/, `signingConfigs {${RELEASE_SIGNING_CONFIG}`)
      .replace(
        /(release \{\s*\/\/ Caution![^\n]*\n[^\n]*\n\s*)signingConfig signingConfigs\.debug/,
        '$1signingConfig signingConfigs.release',
      );
    return gradle;
  });

// O resto da configuração está no app.json (o nome e o slug, que o `ExpoConfig` exige, inclusive). Daqui vêm a
// versão, do package.json, a mesma que o app mostra (`APP_VERSION`), para ela mudar num lugar só, e a assinatura.
export default ({ config }: ConfigContext) =>
  withReleaseSigning({ ...config, version: packageJson.version } as ExpoConfig);
