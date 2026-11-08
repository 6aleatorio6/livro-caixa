import { AndroidConfig, withAndroidManifest, withAppBuildGradle, type ConfigPlugin } from 'expo/config-plugins';
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

// Trocar a fonte, a densidade ou o idioma do celular com o app aberto recriava a `MainActivity`, e no build de debug a
// nova Activity montava uma segunda raiz do app por cima da primeira. Com esses valores no `android:configChanges`, o
// Android entrega a mudança à Activity que já existe, e o React Native atualiza a tela sem recriá-la. O negrito do
// texto (`fontWeightAdjustment`), o modo de cor e o gênero gramatical também recriam a Activity, e entram pelo mesmo
// motivo.
const ACTIVITY_CONFIG_CHANGES = [
  'fontScale',
  'density',
  'locale',
  'layoutDirection',
  'fontWeightAdjustment',
  'colorMode',
  'grammaticalGender',
];

// O `prebuild` sem `--clean` aplica o plugin de novo sobre o manifesto já gerado: o conjunto evita repetir um valor.
const withStableActivity: ConfigPlugin = (config) =>
  withAndroidManifest(config, (manifest) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(manifest.modResults);
    const current = (activity.$['android:configChanges'] ?? '').split('|').filter(Boolean);
    activity.$['android:configChanges'] = [...new Set([...current, ...ACTIVITY_CONFIG_CHANGES])].join('|');
    return manifest;
  });

// O resto da configuração está no app.json (o nome e o slug, que o `ExpoConfig` exige, inclusive). Daqui vêm a
// versão, do package.json, a mesma que o app mostra (`APP_VERSION`), para ela mudar num lugar só, a assinatura e a
// `MainActivity` que não é recriada.
export default ({ config }: ConfigContext) =>
  withStableActivity(withReleaseSigning({ ...config, version: packageJson.version } as ExpoConfig));
