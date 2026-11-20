// eslint-disable-next-line no-restricted-imports -- o package.json fica fora de src/, aonde o @/ não chega
import packageJson from '../../../package.json';

/** A versão do app vem do `package.json`, o mesmo lugar de onde o `app.config.ts` a dá ao APK. */
export const APP_VERSION = packageJson.version;
