// oxlint-disable-next-line no-restricted-imports -- um import só, de fora de src/: um alias pediria o tsconfig e os dois Jest
import packageJson from '../../../package.json';

/** A versão do app vem do `package.json`, o mesmo lugar de onde o `app.config.ts` a dá ao APK. */
export const APP_VERSION = packageJson.version;
