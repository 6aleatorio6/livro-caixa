import packageJson from '../../../package.json';

/** A versão do app vem do `package.json`, o mesmo lugar de onde o `app.config.ts` a dá ao APK. */
export const APP_VERSION = packageJson.version;
